import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Clipboard, FileText, Activity, Plus, Save, Camera, X, Trash2, RefreshCw, Upload } from 'lucide-react';
import { pacienteService, antecedenteGOService, consultaMedicaService, historiaClinicaService, medicoService, uploadService, usuarioService, recetaService, detalleRecetaService } from '../services/api';
import { extractFotoUrl } from '../utils/photo';
import ProfilePhotoPicker from '../components/ProfilePhotoPicker';
import UserAvatar from '../components/UserAvatar';
import './Patients.css';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [historiaClinica, setHistoriaClinica] = useState(null);
  const [antecedentes, setAntecedentes] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [activeTab, setActiveTab] = useState(() => location.state?.defaultTab || 'resumen');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const photoInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [pendingFotoUrl, setPendingFotoUrl] = useState(null);
  // Camera states
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  // Receta detail rows
  const [recetaDetalles, setRecetaDetalles] = useState([{ nombre_medicamento: '', dosis: '', frecuencia: '', duracion: '' }]);

  // States for forms
  const [showConsultaForm, setShowConsultaForm] = useState(false);
  const [showAntecedentesForm, setShowAntecedentesForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [consultaEnEdicion, setConsultaEnEdicion] = useState(null);
  const [isEditingHistoria, setIsEditingHistoria] = useState(false);

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditingProfile(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const res = await medicoService.getAll();
        setMedicos(res.data?.medicos || []);
      } catch (err) {
        console.error("Error fetching medicos", err);
      }
    };
    fetchMedicos();

    const fetchPatient = async () => {
      try {
        if (!id || id === 'undefined') {
          setLoading(false);
          return;
        }

        if (id === 'nuevo') {
          try {
            // Fetch users to let admin/medic select one to link
            const uRes = await import('../services/api').then(m => m.usuarioService.getAll());
            const usersData = uRes.data?.usuarios || uRes.data || [];
            // Filtrar por los que tienen rol PACIENTE (id_rol 3 o nombre_rol PACIENTE)
            setUsuarios(usersData.filter(u => u.id_rol === 3 || (u.rol && u.rol.nombre_rol === 'PACIENTE')));
          } catch (err) {
            console.error("Error fetching users for linking patient", err);
          }

          setPatient({
            id_usuario: '',
            ocupacion: '',
            estado_civil: '',
            seguro_medico: '',
            tipo_sangre: '',
            observaciones: '',
            referencia: '',
            contacto_emergencia_nombre: '',
            contacto_emergencia_telefono: '',
            contacto_emergencia_parentesco: ''
          });
          setLoading(false);
          return;
        }

        const res = await pacienteService.getById(id);
        const p = res.data?.paciente || res.data;
        
        if (!p || (!p.id_paciente && !p.id)) {
           setPatient(null);
           return;
        }

        setPatient({
          id: p.id_paciente || p.id,
          id_usuario: p.id_usuario,
          nombre: p.usuario?.primer_nombre || p.primer_nombre || p.nombre || '',
          apellido: p.usuario?.primer_apellido || p.primer_apellido || p.apellido || '',
          ci: p.usuario?.ci || p.ci || p.dni || '',
          telefono: p.usuario?.telefono || p.telefono || '',
          fechaNacimiento: p.usuario?.fecha_nacimiento || p.fecha_nacimiento || p.fechaNacimiento || '',
          direccion: p.usuario?.direccion || p.direccion || '',
          estadoCivil: p.estado_civil || p.estadoCivil || '',
          ocupacion: p.ocupacion || '',
          grupoSanguineo: p.tipo_sangre || p.grupoSanguineo || '',
          seguroMedico: p.seguro_medico || p.seguroMedico || '',
          observaciones: p.observaciones || '',
          referencia: p.referencia || '',
          contacto_emergencia_nombre: p.contacto_emergencia_nombre || '',
          contacto_emergencia_telefono: p.contacto_emergencia_telefono || '',
          contacto_emergencia_parentesco: p.contacto_emergencia_parentesco || '',
          fotoPerfilUrl: p.usuario?.foto_perfil_url || p.foto_perfil_url || p.fotoPerfilUrl || ''
        });

        // Load or Create Historia Clínica
        try {
          const hcRes = await historiaClinicaService.getByPaciente(p.id_paciente || p.id);
          const historia = hcRes.data?.historia;
          if (historia) {
             setHistoriaClinica(historia);
             if (historia.antecedenteGO) setAntecedentes(historia.antecedenteGO);
             if (historia.consultas) setConsultas(historia.consultas);
          } else {
             const hcCreateRes = await historiaClinicaService.create({ id_paciente: p.id_paciente || p.id });
             if (hcCreateRes.data?.historia) setHistoriaClinica(hcCreateRes.data.historia);
          }
        } catch (hcError) {
          if (hcError.response && hcError.response.status === 404) {
             // Not found, try to auto-create
             try {
                 const hcCreateRes = await historiaClinicaService.create({ id_paciente: p.id_paciente || p.id });
                 if (hcCreateRes.data?.historia) setHistoriaClinica(hcCreateRes.data.historia);
             } catch (createErr) {
                 console.error("Error creating historia clinica", createErr);
             }
          } else {
             console.error("Error fetching historia clinica", hcError);
          }
        }

      } catch (error) {
        console.error("Error fetching patient", error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      // Assuming api maps fields
      const payload = {
        id_usuario: patient.id_usuario,
        ocupacion: patient.ocupacion,
        estado_civil: patient.estado_civil,
        seguro_medico: patient.seguro_medico,
        tipo_sangre: patient.tipo_sangre,
        referencia: patient.referencia,
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre,
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono,
        contacto_emergencia_parentesco: patient.contacto_emergencia_parentesco,
        observaciones: patient.observaciones
      };
      const fotoParaGuardar = pendingFotoUrl || patient.fotoPerfilUrl;
      if (fotoParaGuardar && patient.id_usuario) {
        try {
          await usuarioService.update(patient.id_usuario, { foto_perfil_url: fotoParaGuardar });
        } catch (photoErr) {
          console.error('Error saving photo for new patient', photoErr);
        }
      } else if (photoFile && patient.id_usuario) {
        try {
          const uploadRes = await uploadService.uploadProfilePhoto(photoFile);
          const newPhotoUrl = extractFotoUrl(uploadRes);
          if (newPhotoUrl) await usuarioService.update(patient.id_usuario, { foto_perfil_url: newPhotoUrl });
        } catch (photoErr) {
          console.error('Error uploading photo for new patient', photoErr);
        }
      }
      const res = await pacienteService.create(payload);
      setAlertModal({ show: true, message: 'Paciente creado exitosamente', type: 'success' });
      setTimeout(() => navigate('/app/pacientes'), 1500);
    } catch (error) {
      console.error("Error creating patient", error);
      setAlertModal({ show: true, message: 'Error al crear paciente', type: 'error' });
    }
  };

  // Camera: start
  const startCamera = async () => {
    setCapturedPhoto(null);
    setShowCamera(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: 'user' }, audio: false
        });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setAlertModal({ show: true, message: 'No se pudo acceder a la cámara. Verifica los permisos.', type: 'error' });
        setShowCamera(false);
      }
    }, 300);
  };

  const stopCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    setShowCamera(false); setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480; canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `patient-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setCapturedPhoto({ file, preview: URL.createObjectURL(blob) });
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setTimeout(() => { if (videoRef.current && cameraStream) videoRef.current.srcObject = cameraStream; }, 100);
  };

  const useCapturedPhoto = () => {
    if (capturedPhoto) {
      setPhotoFile(capturedPhoto.file);
      setPhotoPreview(capturedPhoto.preview);
      stopCamera();
    }
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      // Upload photo first if there is a new one
      let newPhotoUrl = patient.fotoPerfilUrl;
      if (photoFile && patient.id_usuario) {
        try {
          const uploadRes = await uploadService.uploadProfilePhoto(photoFile);
          newPhotoUrl = extractFotoUrl(uploadRes) || newPhotoUrl;
          await usuarioService.update(patient.id_usuario, { foto_perfil_url: newPhotoUrl });
        } catch (photoErr) {
          console.error('Error uploading photo', photoErr);
        }
      } else if (patient.fotoPerfilUrl && patient.id_usuario) {
        await usuarioService.update(patient.id_usuario, { foto_perfil_url: patient.fotoPerfilUrl });
        newPhotoUrl = patient.fotoPerfilUrl;
      }

      const patientPayload = {
        ocupacion: patient.ocupacion,
        estado_civil: patient.estadoCivil,
        seguro_medico: patient.seguroMedico,
        tipo_sangre: patient.grupoSanguineo,
        observaciones: patient.observaciones,
        referencia: patient.referencia,
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre,
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono,
        contacto_emergencia_parentesco: patient.contacto_emergencia_parentesco
      };
      await pacienteService.update(patient.id, patientPayload);

      if (patient.id_usuario) {
        const userPayload = {
          primer_nombre: patient.nombre,
          primer_apellido: patient.apellido,
          ci: patient.ci,
          telefono: patient.telefono,
          fecha_nacimiento: patient.fechaNacimiento,
          direccion: patient.direccion
        };
        await usuarioService.update(patient.id_usuario, userPayload);
      }

      setPatient(prev => ({ ...prev, fotoPerfilUrl: newPhotoUrl }));
      setPhotoFile(null);
      setPhotoPreview(null);
      setAlertModal({ show: true, message: 'Perfil de paciente actualizado correctamente', type: 'success' });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating patient", error);
      setAlertModal({ show: true, message: 'Error al actualizar el perfil de paciente', type: 'error' });
    }
  };

  const handleCreateAntecedentes = async (e) => {
    e.preventDefault();
    if (!historiaClinica) {
      setAlertModal({ show: true, message: 'No hay historia clínica asociada. Intente recargar.', type: 'error' });
      return;
    }
    
    try {
      const formData = new FormData(e.target);
      const payload = {
        id_historia_clinica: historiaClinica.id_historia_clinica,
        menarquia: formData.get('menarquia'),
        ritmo_menstrual: formData.get('ritmo_menstrual'),
        fum: formData.get('fum') || null,
        gestas: parseInt(formData.get('gestas')) || 0,
        partos: parseInt(formData.get('partos')) || 0,
        abortos: parseInt(formData.get('abortos')) || 0,
        cesareas: parseInt(formData.get('cesareas')) || 0,
        hijos_vivos: parseInt(formData.get('hijos_vivos')) || 0,
        metodo_anticonceptivo: formData.get('metodo_anticonceptivo'),
        observaciones_obstetricas: formData.get('observaciones_obstetricas')
      };

      let res;
      if (antecedentes && antecedentes.id_antecedente_go) {
        res = await antecedenteGOService.update(antecedentes.id_antecedente_go, payload);
        setAlertModal({ show: true, message: 'Antecedentes actualizados exitosamente', type: 'success' });
      } else {
        res = await antecedenteGOService.create(payload);
        setAlertModal({ show: true, message: 'Antecedentes guardados exitosamente', type: 'success' });
      }
      setAntecedentes(res.data?.antecedente || res.data?.antecedenteGO || payload);
      setShowAntecedentesForm(false);
    } catch (error) {
      console.error("Error saving antecedentes", error);
      setAlertModal({ show: true, message: 'Error al guardar antecedentes', type: 'error' });
    }
  };

  const handleCreateConsulta = async (e) => {
    e.preventDefault();
    if (!historiaClinica) {
      setAlertModal({ show: true, message: 'No hay historia clínica asociada. Intente recargar.', type: 'error' });
      return;
    }

    try {
      const formData = new FormData(e.target);
      const payload = {
        id_historia_clinica: historiaClinica.id_historia_clinica,
        id_paciente: patient.id,
        id_medico: formData.get('id_medico'),
        motivo_consulta: formData.get('motivo_consulta'),
        presion_arterial: formData.get('presion_arterial'),
        frecuencia_cardiaca: parseInt(formData.get('frecuencia_cardiaca')) || null,
        peso: parseFloat(formData.get('peso')) || null,
        talla: parseFloat(formData.get('talla')) || null,
        diagnostico_general: formData.get('diagnostico_general'),
        tratamiento_general: formData.get('tratamiento_general'),
      };

      if (!payload.id_medico) {
         setAlertModal({ show: true, message: 'Debe seleccionar un médico tratante.', type: 'error' });
         return;
      }

      const tratamiento = formData.get('tratamiento_general');

      if (consultaEnEdicion) {
        const res = await consultaMedicaService.update(consultaEnEdicion.id_consulta, payload);
        const updatedConsulta = res.data?.consulta || res.data || payload;

        // Handle receta: update existing or create
        try {
          if (consultaEnEdicion.receta) {
            const recetaId = consultaEnEdicion.receta.id_receta || consultaEnEdicion.receta.id;
            await recetaService.update(recetaId, { indicaciones_generales: tratamiento, id_medico: payload.id_medico });
            // Sync detalleReceta: update if id present, otherwise create
            for (const det of recetaDetalles) {
              if (!det.nombre_medicamento || !det.nombre_medicamento.trim()) continue;
              if (det.id_detalle_receta) {
                await detalleRecetaService.update(det.id_detalle_receta, {
                  medicamento: det.nombre_medicamento,
                  dosis: det.dosis,
                  frecuencia: det.frecuencia,
                  duracion: det.duracion,
                  via_administracion: det.via_administracion || null,
                  observaciones: det.observaciones || null,
                });
              } else {
                await detalleRecetaService.create({
                  id_receta: recetaId,
                  medicamento: det.nombre_medicamento,
                  dosis: det.dosis,
                  frecuencia: det.frecuencia,
                  duracion: det.duracion,
                  via_administracion: det.via_administracion || null,
                  observaciones: det.observaciones || null,
                });
              }
            }
          } else if ((recetaDetalles && recetaDetalles.some(d => d.nombre_medicamento && d.nombre_medicamento.trim())) || tratamiento) {
            const recetaRes = await recetaService.create({ id_consulta: consultaEnEdicion.id_consulta, id_paciente: patient.id, id_medico: payload.id_medico, indicaciones_generales: tratamiento });
            const recetaObj = recetaRes.data?.receta || recetaRes.data || null;
            if (recetaObj) {
              for (const det of recetaDetalles) {
                if (!det.nombre_medicamento || !det.nombre_medicamento.trim()) continue;
                await detalleRecetaService.create({
                  id_receta: recetaObj.id_receta || recetaObj.id,
                  medicamento: det.nombre_medicamento,
                  dosis: det.dosis,
                  frecuencia: det.frecuencia,
                  duracion: det.duracion,
                  via_administracion: det.via_administracion || null,
                  observaciones: det.observaciones || null,
                });
              }
              updatedConsulta.receta = recetaObj;
            }
          }
        } catch (recErr) {
          console.error('Error syncing receta on update', recErr);
        }

        setConsultas(consultas.map(c => c.id_consulta === consultaEnEdicion.id_consulta ? { ...c, ...updatedConsulta } : c));
        setAlertModal({ show: true, message: 'Consulta actualizada exitosamente', type: 'success' });
      } else {
        const res = await consultaMedicaService.create(payload);
        const nuevaConsulta = res.data?.consulta || res.data || payload;

        // Create receta and detalle if provided
        try {
          if ((recetaDetalles && recetaDetalles.some(d => d.nombre_medicamento && d.nombre_medicamento.trim())) || tratamiento) {
            const recetaRes = await recetaService.create({ id_consulta: nuevaConsulta.id_consulta || nuevaConsulta.id, id_paciente: patient.id, id_medico: payload.id_medico, indicaciones_generales: tratamiento });
            const recetaObj = recetaRes.data?.receta || recetaRes.data || null;
            if (recetaObj) {
              for (const det of recetaDetalles) {
                if (!det.nombre_medicamento || !det.nombre_medicamento.trim()) continue;
                await detalleRecetaService.create({
                  id_receta: recetaObj.id_receta || recetaObj.id,
                  medicamento: det.nombre_medicamento,
                  dosis: det.dosis,
                  frecuencia: det.frecuencia,
                  duracion: det.duracion,
                  via_administracion: det.via_administracion || null,
                  observaciones: det.observaciones || null,
                });
              }
              nuevaConsulta.receta = recetaObj;
            }
          }
        } catch (recErr) {
          console.error('Error creating receta for new consulta', recErr);
        }

        setConsultas([nuevaConsulta, ...consultas]);
        setAlertModal({ show: true, message: 'Consulta registrada exitosamente', type: 'success' });
      }
      setShowConsultaForm(false);
      setConsultaEnEdicion(null);
    } catch (error) {
      console.error("Error saving consulta", error);
      setAlertModal({ show: true, message: 'Error al guardar la consulta', type: 'error' });
    }
  };

  const handleDeleteConsulta = async (id_consulta) => {
    setDeleteModal({ show: true, id: id_consulta });
  };

  const confirmDeleteConsulta = async () => {
    try {
      await consultaMedicaService.delete(deleteModal.id);
      setConsultas(consultas.filter(c => c.id_consulta !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
      setAlertModal({ show: true, message: 'Consulta eliminada exitosamente', type: 'success' });
    } catch (error) {
      console.error('Error deleting consulta', error);
      setDeleteModal({ show: false, id: null });
      setAlertModal({ show: true, message: 'Error al eliminar la consulta', type: 'error' });
    }
  };

  const openEditConsulta = (consulta) => {
    setConsultaEnEdicion(consulta);
    // Restore receta detalles if editing
    if (consulta.receta?.detalleReceta?.length > 0) {
      setRecetaDetalles(consulta.receta.detalleReceta.map(d => ({
        id_detalle_receta: d.id_detalle_receta || d.id || null,
        nombre_medicamento: d.medicamento || d.nombre_medicamento || '',
        dosis: d.dosis || '',
        frecuencia: d.frecuencia || '',
        duracion: d.duracion || '',
        via_administracion: d.via_administracion || '',
        observaciones: d.observaciones || ''
      })));
    } else {
      setRecetaDetalles([{ nombre_medicamento: '', dosis: '', frecuencia: '', duracion: '' }]);
    }
    setShowConsultaForm(true);
  };

  const handleUpdateHistoria = async (e) => {
    e.preventDefault();
    if (!historiaClinica) return;
    try {
      const formData = new FormData(e.target);
      const payload = {
        motivo_consulta: formData.get('motivo_consulta'),
        enfermedad_actual: formData.get('enfermedad_actual'),
        observaciones_generales: formData.get('observaciones_generales'),
      };
      const res = await historiaClinicaService.update(historiaClinica.id_historia_clinica, payload);
      setHistoriaClinica({ ...historiaClinica, ...res.data?.historia });
      setAlertModal({ show: true, message: 'Historia Clínica actualizada', type: 'success' });
      setIsEditingHistoria(false);
    } catch (error) {
      console.error("Error updating historia", error);
      setAlertModal({ show: true, message: 'Error al actualizar historia clínica', type: 'error' });
    }
  };

  if (id === 'nuevo') {
    return (
      <>
        <div className="patient-detail-container animate-fade-in">
          <div className="detail-header">
            <button className="back-btn" onClick={() => navigate('/app/pacientes')}>
              <ArrowLeft size={20} /> Cancelar
            </button>
          </div>
          <div className="card">
            <h2>Vincular Expediente Clínico</h2>
            <p style={{ color: 'var(--text-muted)' }}>Selecciona un usuario registrado para crearle su expediente médico.</p>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <ProfilePhotoPicker
                value={pendingFotoUrl}
                onChange={setPendingFotoUrl}
                label="Foto del paciente (opcional)"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Usuario / Paciente Registrado</label>
                  <select value={patient.id_usuario} onChange={e => setPatient({ ...patient, id_usuario: e.target.value })} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">-- Seleccionar Usuario --</option>
                    {usuarios.map(u => (
                      <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>
                        {u.primer_nombre || u.nombre} {u.primer_apellido || u.apellido} - CI: {u.ci || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ocupación</label>
                  <input type="text" value={patient.ocupacion} onChange={e => setPatient({ ...patient, ocupacion: e.target.value })} placeholder="Ej. Docente" />
                </div>
                <div className="form-group">
                  <label>Estado Civil</label>
                  <select value={patient.estado_civil} onChange={e => setPatient({ ...patient, estado_civil: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="Soltera">Soltera</option>
                    <option value="Casada">Casada</option>
                    <option value="Divorciada">Divorciada</option>
                    <option value="Viuda">Viuda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Sangre</label>
                  <select value={patient.tipo_sangre} onChange={e => setPatient({ ...patient, tipo_sangre: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                 <div className="form-group">
                  <label>Seguro Médico</label>
                  <input type="text" value={patient.seguro_medico} onChange={e => setPatient({ ...patient, seguro_medico: e.target.value })} placeholder="Ej. SUS, Caja Nacional..." />
                </div>
                <div className="form-group">
                  <label>Referencia / Recomendado por</label>
                  <input type="text" value={patient.referencia} onChange={e => setPatient({ ...patient, referencia: e.target.value })} placeholder="Ej. Dr. Flores" />
                </div>
                <div className="form-group">
                  <label>Nombre Contacto de Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_nombre} onChange={e => setPatient({ ...patient, contacto_emergencia_nombre: e.target.value })} placeholder="Ej. María Gómez" />
                </div>
                <div className="form-group">
                  <label>Teléfono Contacto de Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_telefono} onChange={e => setPatient({ ...patient, contacto_emergencia_telefono: e.target.value })} placeholder="Ej. 70712345" />
                </div>
                <div className="form-group">
                  <label>Parentesco Contacto de Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_parentesco} onChange={e => setPatient({ ...patient, contacto_emergencia_parentesco: e.target.value })} placeholder="Ej. Esposo, Madre" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observaciones</label>
                  <textarea value={patient.observaciones} onChange={e => setPatient({ ...patient, observaciones: e.target.value })} placeholder="Observaciones o notas iniciales..." rows="3" style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', fontFamily: 'inherit' }}></textarea>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                <Save size={16} style={{ marginRight: '8px' }} /> Crear Expediente Clínico
              </button>
            </form>
          </div>
        </div>

        {alertModal.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
              {alertModal.type === 'error' ? <Activity size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <Save size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
              <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
              <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!patient) {
    return (
      <div className="patient-detail-container animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Paciente no encontrado</h2>
        <p>El paciente que buscas no existe o no se ha cargado correctamente.</p>
        <button className="btn btn-primary" onClick={() => navigate('/app/pacientes')} style={{ marginTop: '20px' }}>Volver a Pacientes</button>
      </div>
    );
  }

  return (
    <>
      <div className="patient-detail-container animate-fade-in">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/app/pacientes')}>
            <ArrowLeft size={20} /> Volver
          </button>
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => setIsEditingProfile(true)}>
              <Edit size={16} /> Editar Perfil
            </button>
          </div>
        </div>

        {/* Profile Header */}
        {isEditingProfile ? (
          <div className="patient-profile-card card animate-fade-in">
            <h3>Editar Perfil de Paciente</h3>
            <form onSubmit={handleUpdatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <ProfilePhotoPicker
                value={photoPreview || patient.fotoPerfilUrl}
                onChange={(url) => {
                  setPatient((p) => ({ ...p, fotoPerfilUrl: url }));
                  setPhotoPreview(url);
                  setPhotoFile(null);
                }}
                size={110}
                label="Foto de perfil"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Nombre(s) *</label>
                  <input type="text" value={patient.nombre} onChange={e => setPatient({ ...patient, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Apellido(s) *</label>
                  <input type="text" value={patient.apellido} onChange={e => setPatient({ ...patient, apellido: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>CI</label>
                  <input type="text" value={patient.ci} onChange={e => setPatient({ ...patient, ci: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" value={patient.telefono} onChange={e => setPatient({ ...patient, telefono: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" value={patient.fechaNacimiento} onChange={e => setPatient({ ...patient, fechaNacimiento: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input type="text" value={patient.direccion} onChange={e => setPatient({ ...patient, direccion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ocupación</label>
                  <input type="text" value={patient.ocupacion} onChange={e => setPatient({ ...patient, ocupacion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Estado Civil</label>
                  <select value={patient.estadoCivil} onChange={e => setPatient({ ...patient, estadoCivil: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="Soltera">Soltera</option>
                    <option value="Casada">Casada</option>
                    <option value="Divorciada">Divorciada</option>
                    <option value="Viuda">Viuda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Sangre</label>
                  <select value={patient.grupoSanguineo} onChange={e => setPatient({ ...patient, grupoSanguineo: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Seguro Médico</label>
                  <input type="text" value={patient.seguroMedico} onChange={e => setPatient({ ...patient, seguroMedico: e.target.value })} placeholder="Ej. SUS, Caja Nacional..." />
                </div>
                <div className="form-group">
                  <label>Referencia</label>
                  <input type="text" value={patient.referencia} onChange={e => setPatient({ ...patient, referencia: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Nombre Contacto Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_nombre} onChange={e => setPatient({ ...patient, contacto_emergencia_nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono Contacto Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_telefono} onChange={e => setPatient({ ...patient, contacto_emergencia_telefono: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parentesco Contacto Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_parentesco} onChange={e => setPatient({ ...patient, contacto_emergencia_parentesco: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observaciones</label>
                  <textarea value={patient.observaciones} onChange={e => setPatient({ ...patient, observaciones: e.target.value })} rows="3"></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary"><Save size={16} style={{ marginRight: '8px' }} /> Guardar Cambios</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditingProfile(false); setPhotoPreview(null); setPhotoFile(null); }}>Cancelar</button>
              </div>
            </form>

            {showCamera && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                <div className="card animate-fade-in" style={{ width: '95%', maxWidth: '700px', padding: '20px', backgroundColor: 'white', position: 'relative' }}>
                  <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={stopCamera}><X size={20} /></button>
                  <h4 style={{ marginTop: 0 }}>Capturar Foto con Cámara</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    {!capturedPhoto ? (
                      <>
                        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', maxWidth: '560px', borderRadius: '14px', backgroundColor: '#000' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button type="button" className="btn btn-primary" onClick={capturePhoto}><Camera size={16} style={{ marginRight: '8px' }} /> Tomar foto</button>
                          <button type="button" className="btn btn-secondary" onClick={stopCamera}>Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={capturedPhoto.preview} alt="Captura" style={{ width: '100%', maxWidth: '560px', borderRadius: '14px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button type="button" className="btn btn-primary" onClick={useCapturedPhoto}>Usar esta foto</button>
                          <button type="button" className="btn btn-secondary" onClick={retakePhoto}>Volver a tomar</button>
                          <button type="button" className="btn btn-outline-secondary" onClick={stopCamera}>Cancelar</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="patient-profile-card card">
            <div className="profile-header">
              <div className="profile-avatar-lg" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {patient.fotoPerfilUrl ? (
                  <img src={patient.fotoPerfilUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  `${patient.nombre.charAt(0)}${patient.apellido.charAt(0)}`
                )}
              </div>
              <div className="profile-titles">
                <h2>{patient.nombre} {patient.apellido}</h2>
                <p>CI: {patient.ci || patient.dni} | Grupo Sanguíneo: <span className="blood-type">{patient.grupoSanguineo || 'N/A'}</span></p>
              </div>
            </div>
            <div className="profile-info-grid">
              <div className="info-group">
                <label>Fecha de Nacimiento</label>
                <p>{patient.fechaNacimiento || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Teléfono</label>
                <p>{patient.telefono || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Dirección</label>
                <p>{patient.direccion || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Ocupación</label>
                <p>{patient.ocupacion || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Estado Civil</label>
                <p>{patient.estadoCivil || patient.estado_civil || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Seguro Médico</label>
                <p>{patient.seguroMedico || patient.seguro_medico || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Referencia</label>
                <p>{patient.referencia || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Contacto de Emergencia</label>
                <p>
                  {patient.contacto_emergencia_nombre ? (
                    `${patient.contacto_emergencia_nombre} (${patient.contacto_emergencia_parentesco || 'Sin parentesco'}) - ${patient.contacto_emergencia_telefono || 'Sin tel.'}`
                  ) : 'N/A'}
                </p>
              </div>
              {patient.observaciones && (
                <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observaciones</label>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{patient.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Records Tabs */}
        <div className="patient-tabs card">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
              <FileText size={16} /> Resumen
            </button>
            <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
              <Clipboard size={16} /> Antecedentes
            </button>
            <button className={`tab-btn ${activeTab === 'consultas' ? 'active' : ''}`} onClick={() => setActiveTab('consultas')}>
              <Activity size={16} /> Consultas y Recetas
            </button>
          </div>

          <div className="tab-content" style={{ padding: '20px' }}>
            {activeTab === 'resumen' && (
              <div className="resumen-tab">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3>Historia Clínica General</h3>
                </div>

                {historiaClinica ? (
                  <div className="card" style={{ backgroundColor: 'rgba(255, 105, 180, 0.05)', border: '1px solid rgba(255, 105, 180, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ color: 'var(--primary-pink)', margin: 0 }}>Resumen del Expediente</h4>
                      <button className="btn btn-primary btn-sm" onClick={() => setIsEditingHistoria(true)}>
                        <Edit size={14} style={{ marginRight: '5px' }} /> Editar
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Fecha de Apertura</p>
                        <p style={{ fontWeight: 600 }}>{historiaClinica?.fecha_apertura ? new Date(historiaClinica.fecha_apertura).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Total de Consultas</p>
                        <p style={{ fontWeight: 600, fontSize: '20px', color: 'var(--primary-pink)' }}>{consultas.length}</p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0,0,0,0.07)', gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Motivo de Consulta Principal</p>
                        <p>{historiaClinica?.motivo_consulta || <em style={{ color: 'var(--text-muted)' }}>No especificado</em>}</p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0,0,0,0.07)', gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Enfermedad Actual</p>
                        <p>{historiaClinica?.enfermedad_actual || <em style={{ color: 'var(--text-muted)' }}>No especificada</em>}</p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0,0,0,0.07)', gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Observaciones Generales</p>
                        <p>{historiaClinica?.observaciones_generales || <em style={{ color: 'var(--text-muted)' }}>No especificadas</em>}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-sm">No se pudo cargar la historia clínica. Intente recargar la página.</div>
                )}

                {/* Inline Edit Modal for Historia */}
                {isEditingHistoria && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
                    <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '600px', padding: '30px', backgroundColor: 'white', maxHeight: '85vh', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0 }}>Editar Historia Clínica General</h4>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsEditingHistoria(false)}><X size={20} /></button>
                      </div>
                      <form onSubmit={handleUpdateHistoria}>
                        <div className="form-group">
                          <label>Motivo de Consulta Principal</label>
                          <textarea name="motivo_consulta" rows="2" defaultValue={historiaClinica?.motivo_consulta || ''}></textarea>
                        </div>
                        <div className="form-group" style={{ marginTop: '15px' }}>
                          <label>Enfermedad Actual</label>
                          <textarea name="enfermedad_actual" rows="3" defaultValue={historiaClinica?.enfermedad_actual || ''}></textarea>
                        </div>
                        <div className="form-group" style={{ marginTop: '15px' }}>
                          <label>Observaciones Generales</label>
                          <textarea name="observaciones_generales" rows="2" defaultValue={historiaClinica?.observaciones_generales || ''}></textarea>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button type="submit" className="btn btn-primary"><Save size={16} style={{ marginRight: '8px' }} /> Guardar Historia</button>
                          <button type="button" className="btn btn-secondary" onClick={() => setIsEditingHistoria(false)}>Cancelar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'historial' && (
              <div className="historial-tab animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Antecedentes Médicos (Historia Clínica)</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAntecedentesForm(!showAntecedentesForm)}>
                    <Plus size={16} /> {showAntecedentesForm ? 'Cancelar' : (antecedentes ? 'Editar Antecedentes' : 'Agregar Antecedentes')}
                  </button>
                </div>

                {showAntecedentesForm ? (
                  <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                    <h4>Formulario de Antecedentes Gineco-Obstétricos (AGO)</h4>
                    <form onSubmit={handleCreateAntecedentes}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div className="form-group"><label>Menarca (edad)</label><input type="text" name="menarquia" defaultValue={antecedentes?.menarquia || ''} /></div>
                        <div className="form-group"><label>Ritmo Menstrual</label><input type="text" name="ritmo_menstrual" placeholder="Ej: 28/4" defaultValue={antecedentes?.ritmo_menstrual || ''} /></div>
                        <div className="form-group"><label>FUM (Fecha Última Menstruación)</label><input type="date" name="fum" defaultValue={antecedentes?.fum || ''} /></div>
                        <div className="form-group"><label>Gestaciones (G)</label><input type="number" name="gestas" defaultValue={antecedentes?.gestas || 0} /></div>
                        <div className="form-group"><label>Partos (P)</label><input type="number" name="partos" defaultValue={antecedentes?.partos || 0} /></div>
                        <div className="form-group"><label>Abortos (A)</label><input type="number" name="abortos" defaultValue={antecedentes?.abortos || 0} /></div>
                        <div className="form-group"><label>Cesáreas (C)</label><input type="number" name="cesareas" defaultValue={antecedentes?.cesareas || 0} /></div>
                        <div className="form-group"><label>Hijos Vivos</label><input type="number" name="hijos_vivos" defaultValue={antecedentes?.hijos_vivos || 0} /></div>
                        <div className="form-group"><label>Método Anticonceptivo</label><input type="text" name="metodo_anticonceptivo" defaultValue={antecedentes?.metodo_anticonceptivo || ''} /></div>
                      </div>
                      <div className="form-group" style={{ marginTop: '15px' }}><label>Observaciones Obstétricas</label><textarea name="observaciones_obstetricas" rows="2" defaultValue={antecedentes?.observaciones_obstetricas || ''}></textarea></div>
                      <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}><Save size={16} /> Guardar Antecedentes</button>
                    </form>
                  </div>
                ) : antecedentes ? (
                  <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <p><strong>Menarca:</strong> {antecedentes.menarquia || 'N/A'}</p>
                      <p><strong>Ritmo Menstrual:</strong> {antecedentes.ritmo_menstrual || 'N/A'}</p>
                      <p><strong>FUM:</strong> {antecedentes.fum || 'N/A'}</p>
                      <p><strong>Gestaciones:</strong> {antecedentes.gestas || 0}</p>
                      <p><strong>Partos:</strong> {antecedentes.partos || 0}</p>
                      <p><strong>Abortos:</strong> {antecedentes.abortos || 0}</p>
                      <p><strong>Cesáreas:</strong> {antecedentes.cesareas || 0}</p>
                      <p><strong>Hijos Vivos:</strong> {antecedentes.hijos_vivos || 0}</p>
                      <p><strong>Anticonceptivo:</strong> {antecedentes.metodo_anticonceptivo || 'Ninguno'}</p>
                    </div>
                    {antecedentes.observaciones_obstetricas && (
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Observaciones:</strong> {antecedentes.observaciones_obstetricas}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state-sm">No hay antecedentes registrados aún. Haz clic en "Agregar Antecedentes" para comenzar.</div>
                )}
              </div>
            )}

            {activeTab === 'consultas' && (
              <div className="consultas-tab animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Historial de Consultas Médicas</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => { setShowConsultaForm(true); setConsultaEnEdicion(null); }}>
                    <Plus size={16} /> Nueva Consulta
                  </button>
                </div>

                {consultas && consultas.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {consultas.map((consulta, index) => (
                      <div key={consulta.id_consulta || index} className="card" style={{ borderLeft: '4px solid var(--primary-blue)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ color: 'var(--primary-blue)' }}>{new Date(consulta.fecha_consulta || consulta.created_at || new Date()).toLocaleDateString()}</h4>
                          <div>
                            <button className="btn btn-sm" onClick={() => openEditConsulta(consulta)} style={{ marginRight: '10px', backgroundColor: 'var(--light-blue)', color: 'var(--primary-blue)' }}>✏️ Editar</button>
                            <button className="btn btn-sm" onClick={() => handleDeleteConsulta(consulta.id_consulta)} style={{ backgroundColor: 'rgba(234, 84, 85, 0.1)', color: '#ea5455' }}>🗑️ Eliminar</button>
                          </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <p><strong>Motivo:</strong> {consulta.motivo_consulta || 'No especificado'}</p>
                          <p style={{ marginTop: '8px' }}><strong>Diagnóstico:</strong> {consulta.diagnostico_general || 'No especificado'}</p>
                          <p style={{ marginTop: '8px' }}><strong>Tratamiento:</strong> {consulta.tratamiento_general || 'No especificado'}</p>
                          {consulta.receta ? (
                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f4faff', borderRadius: '12px', border: '1px solid rgba(0, 123, 255, 0.12)' }}>
                              <h5 style={{ marginBottom: '10px' }}>Receta</h5>
                              <p><strong>Fecha:</strong> {consulta.receta.fecha_receta ? new Date(consulta.receta.fecha_receta).toLocaleDateString() : 'N/A'}</p>
                              <p><strong>Indicaciones:</strong> {consulta.receta.indicaciones_generales || 'No especificadas'}</p>
                              {consulta.receta.detalleReceta && consulta.receta.detalleReceta.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                  <strong>Detalle de Receta:</strong>
                                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                    {consulta.receta.detalleReceta.map((item) => (
                                      <li key={item.id_detalle_receta || item.id} style={{ marginBottom: '5px' }}>
                                        {item.nombre_medicamento || item.descripcion || 'Detalle sin nombre'} - {item.dosis || 'Sin dosis'}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-sm">No hay consultas registradas. Haz clic en "Nueva Consulta" para registrar una.</div>
                )}
              </div>
            )}

            {/* Consulta Form Modal */}
            {showConsultaForm && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
                <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '720px', padding: '30px', backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0 }}>{consultaEnEdicion ? 'Editar Consulta' : 'Registrar Nueva Consulta'}</h4>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => { setShowConsultaForm(false); setConsultaEnEdicion(null); }}><X size={22} /></button>
                  </div>
                  <form onSubmit={handleCreateConsulta}>
                    <div className="form-group">
                      <label>Médico Tratante</label>
                      <select name="id_medico" defaultValue={consultaEnEdicion?.id_medico || ''} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}>
                        <option value="">-- Seleccionar Médico --</option>
                        {medicos.map(m => (
                          <option key={m.id_medico} value={m.id_medico}>
                            Dr. {m.usuario?.primer_nombre || m.nombre} {m.usuario?.primer_apellido || m.apellido} - {m.especialidad}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginTop: '15px' }}>
                      <label>Motivo de Consulta</label>
                      <textarea name="motivo_consulta" rows="3" placeholder="Síntomas principales, razón de la visita..." defaultValue={consultaEnEdicion?.motivo_consulta || ''} required></textarea>
                    </div>
                    <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Signos Vitales</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                      <div className="form-group"><label>Presión Arterial</label><input type="text" name="presion_arterial" placeholder="120/80" defaultValue={consultaEnEdicion?.presion_arterial || ''} /></div>
                      <div className="form-group"><label>Frecuencia Cardíaca</label><input type="number" name="frecuencia_cardiaca" placeholder="lpm" defaultValue={consultaEnEdicion?.frecuencia_cardiaca || ''} /></div>
                      <div className="form-group"><label>Peso (kg)</label><input type="number" name="peso" step="0.1" defaultValue={consultaEnEdicion?.peso || ''} /></div>
                      <div className="form-group"><label>Talla (cm)</label><input type="number" name="talla" defaultValue={consultaEnEdicion?.talla || ''} /></div>
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <label>Diagnóstico General</label>
                      <input type="text" name="diagnostico_general" defaultValue={consultaEnEdicion?.diagnostico_general || ''} required />
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <label>Tratamiento y Receta Médica</label>
                      <textarea name="tratamiento_general" rows="4" placeholder="Medicamentos, dosis, indicaciones..." defaultValue={consultaEnEdicion?.tratamiento_general || ''} required></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button type="submit" className="btn btn-primary"><Save size={16} style={{ marginRight: '8px' }} />{consultaEnEdicion ? 'Actualizar Consulta' : 'Guardar Consulta'}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowConsultaForm(false); setConsultaEnEdicion(null); }}>Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1150 }}>
          <div className="card animate-fade-in" style={{ padding: '25px', maxWidth: '420px', width: '100%', textAlign: 'center', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '15px' }}>Confirmar eliminación</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>¿Estás seguro de que deseas eliminar esta consulta médica? Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null })}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDeleteConsulta}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            {alertModal.type === 'error' ? <Activity size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <Save size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
            <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientDetail;
