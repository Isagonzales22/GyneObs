const PDFDocument = require("pdfkit");
const {
 HistoriaClinica,
 AntecedenteGinecoObstetrico,
 AntecedentePatologico,
 AntecedenteNoPatologico,
 AntecedenteFamiliar,
 ConsultaMedica,
 ExamenFisico,
 ExamenGinecologico,
 Diagnostico,
 Tratamiento,
 Receta,
 DetalleReceta,
 Paciente,
  Usuario,
  Cita,
  TipoConsulta,
  Medico,
  TipoCirugia,
  Cirugia,
  InsumoMedico,
  MovimientoInventario,
  CategoriaInsumo,
  Rol,
  ContenidoEducativo,
  CategoriaEducativa,
} = require("../../models");


const resumenGeneral = async (req, res) => {
  try {
    const totalPacientes = await Paciente.count();
    const totalCitas = await Cita.count();
    const totalConsultas = await ConsultaMedica.count();
    const totalCirugias = await Cirugia.count();

    const insumosBajoStock = await InsumoMedico.count({
      where: {
        estado: true,
      },
    });

    const insumos = await InsumoMedico.findAll();

    const bajoStock = insumos.filter(
      (insumo) => insumo.stock_actual <= insumo.stock_minimo
    );

    res.json({
      ok: true,
      resumen: {
        total_pacientes: totalPacientes,
        total_citas: totalCitas,
        total_consultas: totalConsultas,
        total_cirugias: totalCirugias,
        insumos_bajo_stock: bajoStock.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar resumen general",
      error: error.message,
    });
  }
};

const reporteInventario = async (req, res) => {
  try {
    const insumos = await InsumoMedico.findAll({
      order: [["nombre", "ASC"]],
    });

    res.json({
      ok: true,
      insumos,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar reporte de inventario",
      error: error.message,
    });
  }
};

const reporteMovimientosInventario = async (req, res) => {
  try {
    const movimientos = await MovimientoInventario.findAll({
      order: [["fecha_movimiento", "DESC"]],
    });

    res.json({
      ok: true,
      movimientos,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar reporte de movimientos",
      error: error.message,
    });
  }
};
const reportePacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "primer_nombre",
            "segundo_nombre",
            "primer_apellido",
            "segundo_apellido",
            "correo_electronico",
            "telefono",
            "ci",
            "sexo",
            "direccion",
            "fecha_nacimiento",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      ok: true,
      total: pacientes.length,
      pacientes,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar reporte de pacientes",
      error: error.message,
    });
  }
};

const reporteCitas = async (req, res) => {
  try {
    const citas = await Cita.findAll({
      include: [
        { model: Paciente, as: "paciente", include: [{ model: Usuario, as: "usuario" }] },
        { model: Medico, as: "medico", include: [{ model: Usuario, as: "usuario" }] },
        { model: TipoConsulta, as: "tipoConsulta" },
      ],
      order: [["fecha_cita", "DESC"]],
    });

    res.json({
      ok: true,
      total: citas.length,
      citas,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar reporte de citas",
      error: error.message,
    });
  }
};
const reporteCirugias = async (req, res) => {
  try {
    const cirugias = await Cirugia.findAll({
      include: [
        { model: Paciente, as: "paciente", include: [{ model: Usuario, as: "usuario" }] },
        { model: Medico, as: "medico", include: [{ model: Usuario, as: "usuario" }] },
        { model: TipoCirugia, as: "tipoCirugia" },
      ],
      order: [["fecha_cirugia", "DESC"]],
    });

    res.json({
      ok: true,
      total: cirugias.length,
      cirugias,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar reporte de cirugías",
      error: error.message,
    });
  }
};

const reporteHistoriaClinica = async (req, res) => {
  try {
    const { idPaciente } = req.params;

    const paciente = await Paciente.findByPk(idPaciente, {
      include: [
        {
          model: Usuario,
          as: "usuario",
        },
      ],
    });

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    const historiaClinica = await HistoriaClinica.findOne({
      where: {
        id_paciente: idPaciente,
      },
    });

    if (!historiaClinica) {
      return res.status(404).json({
        ok: false,
        message: "Historia clínica no encontrada",
      });
    }

    const idHistoria = historiaClinica.id_historia_clinica;

    const antecedentesGO = await AntecedenteGinecoObstetrico.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const antecedentesPatologicos = await AntecedentePatologico.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const antecedentesNoPatologicos = await AntecedenteNoPatologico.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const antecedentesFamiliares = await AntecedenteFamiliar.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const consultas = await ConsultaMedica.findAll({
      where: { id_paciente: idPaciente },
      order: [["fecha_consulta", "DESC"]],
    });

    const idsConsultas = consultas.map((consulta) => consulta.id_consulta);

    const examenesFisicos = await ExamenFisico.findAll({
      where: { id_consulta: idsConsultas },
    });

    const examenesGinecologicos = await ExamenGinecologico.findAll({
      where: { id_consulta: idsConsultas },
    });

    const diagnosticos = await Diagnostico.findAll({
      where: { id_consulta: idsConsultas },
    });

    const tratamientos = await Tratamiento.findAll({
      where: { id_consulta: idsConsultas },
    });

    const recetas = await Receta.findAll({
      where: { id_paciente: idPaciente },
      include: [
        {
          model: DetalleReceta,
          as: "detalleReceta",
        },
      ],
    });

    res.json({
      ok: true,
      reporte: {
        paciente,
        historiaClinica,
        antecedentesGO,
        antecedentesPatologicos,
        antecedentesNoPatologicos,
        antecedentesFamiliares,
        consultas,
        examenesFisicos,
        examenesGinecologicos,
        diagnosticos,
        tratamientos,
        recetas,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar historia clínica completa",
      error: error.message,
    });
  }
};
const reporteHistoriaClinicaPDF = async (req, res) => {
  try {
    const { idPaciente } = req.params;

    const paciente = await Paciente.findByPk(idPaciente, {
      include: [{ model: Usuario, as: "usuario" }],
    });

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    const historiaClinica = await HistoriaClinica.findOne({
      where: { id_paciente: idPaciente },
    });

    if (!historiaClinica) {
      return res.status(404).json({
        ok: false,
        message: "Historia clínica no encontrada",
      });
    }

    const idHistoria = historiaClinica.id_historia_clinica;

    const antecedentesGO = await AntecedenteGinecoObstetrico.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const antecedentesPatologicos = await AntecedentePatologico.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const antecedentesNoPatologicos = await AntecedenteNoPatologico.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const antecedentesFamiliares = await AntecedenteFamiliar.findAll({
      where: { id_historia_clinica: idHistoria },
    });

    const consultas = await ConsultaMedica.findAll({
      where: { id_paciente: idPaciente },
      order: [["fecha_consulta", "DESC"]],
    });

    const idsConsultas = consultas.map((c) => c.id_consulta);

    const examenesFisicos = await ExamenFisico.findAll({
      where: { id_consulta: idsConsultas },
    });

    const examenesGinecologicos = await ExamenGinecologico.findAll({
      where: { id_consulta: idsConsultas },
    });

    const diagnosticos = await Diagnostico.findAll({
      where: { id_consulta: idsConsultas },
    });

    const tratamientos = await Tratamiento.findAll({
      where: { id_consulta: idsConsultas },
    });

    const recetas = await Receta.findAll({
      where: { id_paciente: idPaciente },
      include: [{ model: DetalleReceta, as: "detalleReceta" }],
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=historia_clinica_${paciente.codigo_paciente || "paciente"}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("HISTORIA CLÍNICA GINECO-OBSTÉTRICA", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text("DATOS PERSONALES", { underline: true });
    doc.fontSize(11);
    doc.text(`Nombre: ${paciente.usuario?.primer_nombre || ""} ${paciente.usuario?.segundo_nombre || ""} ${paciente.usuario?.primer_apellido || ""} ${paciente.usuario?.segundo_apellido || ""}`);
    doc.text(`Correo: ${paciente.usuario?.correo_electronico || ""}`);
    doc.text(`Teléfono: ${paciente.usuario?.telefono || ""}`);
    doc.text(`CI: ${paciente.usuario?.ci || ""}`);
    doc.text(`Dirección: ${paciente.usuario?.direccion || ""}`);
    doc.text(`Ocupación: ${paciente.ocupacion || ""}`);
    doc.text(`Estado civil: ${paciente.estado_civil || ""}`);
    doc.text(`Seguro médico: ${paciente.seguro_medico || ""}`);
    doc.text(`Tipo de sangre: ${paciente.tipo_sangre || ""}`);

    doc.moveDown();

    doc.fontSize(14).text("HISTORIA CLÍNICA", { underline: true });
    doc.fontSize(11);
    doc.text(`Fecha primera consulta: ${historiaClinica.fecha_primera_consulta || ""}`);
    doc.text(`Motivo de consulta: ${historiaClinica.motivo_consulta || ""}`);
    doc.text(`Enfermedad actual: ${historiaClinica.enfermedad_actual || ""}`);
    doc.text(`Observaciones: ${historiaClinica.observaciones_generales || ""}`);

    doc.moveDown();

    doc.fontSize(14).text("ANTECEDENTES GINECO-OBSTÉTRICOS", { underline: true });
    antecedentesGO.forEach((a, index) => {
      doc.fontSize(11).text(`Registro ${index + 1}`);
      doc.text(`FUM desconocida: ${a.fum_desconocida ? "Sí" : "No"}`);
      doc.text(`Descripción FUM: ${a.descripcion_fum || ""}`);
      doc.text(`Ritmo menstrual: ${a.ritmo_menstrual || ""}`);
      doc.text(`Ciclos irregulares: ${a.ciclos_irregulares ? "Sí" : "No"}`);
      doc.text(`Gestas: ${a.gestas || 0}`);
      doc.text(`Partos: ${a.partos || 0}`);
      doc.text(`Cesáreas: ${a.cesareas || 0}`);
      doc.text(`Abortos: ${a.abortos || 0}`);
      doc.text(`PAP: ${a.resultado_pap || ""}`);
      doc.text(`Observaciones: ${a.observaciones_obstetricas || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("ANTECEDENTES PATOLÓGICOS", { underline: true });
    antecedentesPatologicos.forEach((a) => {
      doc.fontSize(11).text(`Enfermedades: ${a.enfermedades_base || ""}`);
      doc.text(`Alergias: ${a.alergias || ""}`);
      doc.text(`Cirugías previas: ${a.cirugias_previas || ""}`);
      doc.text(`Medicamentos actuales: ${a.medicamentos_actuales || ""}`);
      doc.text(`Observaciones: ${a.observaciones || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("ANTECEDENTES NO PATOLÓGICOS", { underline: true });
    antecedentesNoPatologicos.forEach((a) => {
      doc.fontSize(11).text(`Ejercicio: ${a.realiza_ejercicio ? "Sí" : "No"}`);
      doc.text(`Alimentación: ${a.alimentacion || ""}`);
      doc.text(`Consumo de agua: ${a.consumo_agua || ""}`);
      doc.text(`Sueño: ${a.habitos_sueno || ""}`);
      doc.text(`Observaciones: ${a.observaciones || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("ANTECEDENTES FAMILIARES", { underline: true });
    antecedentesFamiliares.forEach((a) => {
      doc.fontSize(11).text(`Madre: ${a.antecedentes_madre || ""}`);
      doc.text(`Padre: ${a.antecedentes_padre || ""}`);
      doc.text(`Abuelos: ${a.antecedentes_abuelos || ""}`);
      doc.text(`Pareja: ${a.antecedentes_pareja || ""}`);
      doc.text(`Cáncer familiar: ${a.cancer_familiar || ""}`);
      doc.text(`Observaciones: ${a.otros_antecedentes || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("CONSULTAS MÉDICAS", { underline: true });
    consultas.forEach((c, index) => {
      doc.fontSize(11).text(`Consulta ${index + 1}`);
      doc.text(`Fecha: ${c.fecha_consulta || ""}`);
      doc.text(`Tipo: ${c.tipo_consulta || ""}`);
      doc.text(`Motivo: ${c.motivo_consulta || ""}`);
      doc.text(`Síntomas: ${c.sintomas || ""}`);
      doc.text(`Diagnóstico general: ${c.diagnostico_general || ""}`);
      doc.text(`Tratamiento general: ${c.tratamiento_general || ""}`);
      doc.text(`Indicaciones: ${c.indicaciones || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("DIAGNÓSTICOS", { underline: true });
    diagnosticos.forEach((d) => {
      doc.fontSize(11).text(`Descripción: ${d.descripcion || ""}`);
      doc.text(`CIE10: ${d.cie10 || ""}`);
      doc.text(`Tipo: ${d.tipo_diagnostico || ""}`);
      doc.text(`Observaciones: ${d.observaciones || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("TRATAMIENTOS", { underline: true });
    tratamientos.forEach((t) => {
      doc.fontSize(11).text(`Descripción: ${t.descripcion || ""}`);
      doc.text(`Indicaciones: ${t.indicaciones_generales || ""}`);
      doc.text(`Inicio: ${t.fecha_inicio || ""}`);
      doc.text(`Fin: ${t.fecha_fin || ""}`);
      doc.text(`Observaciones: ${t.observaciones || ""}`);
      doc.moveDown();
    });

    doc.fontSize(14).text("RECETAS", { underline: true });
    recetas.forEach((r) => {
      doc.fontSize(11).text(`Fecha: ${r.fecha_receta || ""}`);
      doc.text(`Indicaciones generales: ${r.indicaciones_generales || ""}`);

      if (r.detalleReceta && r.detalleReceta.length > 0) {
        r.detalleReceta.forEach((det) => {
          doc.text(`Medicamento: ${det.medicamento || ""}`);
          doc.text(`Dosis: ${det.dosis || ""}`);
          doc.text(`Frecuencia: ${det.frecuencia || ""}`);
          doc.text(`Duración: ${det.duracion || ""}`);
          doc.text(`Vía: ${det.via_administracion || ""}`);
          doc.text(`Observaciones: ${det.observaciones || ""}`);
        });
      }

      doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(10).text("Documento generado automáticamente por el Sistema de Gestión Gineco-Obstétrica.", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar PDF de historia clínica",
      error: error.message,
    });
  }
};
const reporteInventarioPDF = async (req, res) => {
  try {
    const insumos = await InsumoMedico.findAll({
      include: [{ model: CategoriaInsumo, as: "categoria" }],
      order: [["nombre", "ASC"]],
    });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_inventario.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("REPORTE DE INVENTARIO MÉDICO", {
      align: "center",
    });

    doc.moveDown();
    doc.fontSize(11).text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(13).text("Listado de insumos", { underline: true });
    doc.moveDown();

    insumos.forEach((insumo, index) => {
      doc.fontSize(11).text(`${index + 1}. ${insumo.nombre}`);
      doc.text(`Categoría: ${insumo.categoria?.nombre || "Sin categoría"}`);
      doc.text(`Descripción: ${insumo.descripcion || ""}`);
      doc.text(`Unidad: ${insumo.unidad_medida || ""}`);
      doc.text(`Stock actual: ${insumo.stock_actual}`);
      doc.text(`Stock mínimo: ${insumo.stock_minimo}`);
      doc.text(`Fecha vencimiento: ${insumo.fecha_vencimiento || "No registrada"}`);
      doc.text(`Estado: ${insumo.estado ? "Activo" : "Inactivo"}`);

      if (insumo.stock_actual <= insumo.stock_minimo) {
        doc.text("ALERTA: Stock bajo");
      }

      doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(10).text(
      "Documento generado automáticamente por el Sistema de Gestión Gineco-Obstétrica.",
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar PDF de inventario",
      error: error.message,
    });
  }
};
const reporteCitasPDF = async (req, res) => {
  try {
    const citas = await Cita.findAll({
      include: [
        {
          model: Paciente,
          as: "paciente",
          include: [{ model: Usuario, as: "usuario" }],
        },
        {
          model: Medico,
          as: "medico",
          include: [{ model: Usuario, as: "usuario" }],
        },
        {
          model: TipoConsulta,
          as: "tipoConsulta",
        },
      ],
      order: [["fecha_cita", "DESC"]],
    });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_citas_medicas.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("REPORTE DE CITAS MÉDICAS", {
      align: "center",
    });

    doc.moveDown();
    doc.fontSize(11).text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);
    doc.text(`Total de citas: ${citas.length}`);
    doc.moveDown();

    citas.forEach((cita, index) => {
      const pacienteUsuario = cita.paciente?.usuario;
      const medicoUsuario = cita.medico?.usuario;

      const nombrePaciente = pacienteUsuario
        ? `${pacienteUsuario.primer_nombre || ""} ${pacienteUsuario.segundo_nombre || ""} ${pacienteUsuario.primer_apellido || ""} ${pacienteUsuario.segundo_apellido || ""}`
        : "Sin paciente";

      const nombreMedico = medicoUsuario
        ? `${medicoUsuario.primer_nombre || ""} ${medicoUsuario.segundo_nombre || ""} ${medicoUsuario.primer_apellido || ""} ${medicoUsuario.segundo_apellido || ""}`
        : "Sin médico";

      doc.fontSize(12).text(`${index + 1}. Cita médica`, { underline: true });
      doc.fontSize(10);
      doc.text(`Paciente: ${nombrePaciente}`);
      doc.text(`Médico: ${nombreMedico}`);
      doc.text(`Tipo de consulta: ${cita.tipoConsulta?.nombre || "No especificado"}`);
      doc.text(`Fecha: ${cita.fecha_cita || ""}`);
      doc.text(`Hora inicio: ${cita.hora_inicio || ""}`);
      doc.text(`Hora fin: ${cita.hora_fin || ""}`);
      doc.text(`Estado: ${cita.estado_cita || ""}`);
      doc.text(`Motivo: ${cita.motivo || ""}`);
      doc.text(`Observaciones: ${cita.observaciones || ""}`);
      doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(10).text(
      "Documento generado automáticamente por el Sistema de Gestión Gineco-Obstétrica.",
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al generar PDF de citas médicas",
      error: error.message,
    });
  }
};

module.exports = {
  resumenGeneral,
  reporteInventario,
  reporteMovimientosInventario,
  reportePacientes,
  reporteCitas,
  reporteCirugias,
  reporteHistoriaClinica,
  reporteHistoriaClinicaPDF,
  reporteInventarioPDF,
  reporteCitasPDF,
  obtenerMetricas: async (req, res) => {
    try {
      const { tipo, pacienteId } = req.query;

      let metricas = {};

      if (tipo === 'general') {
        const totalPacientes = await Paciente.count();
        const totalHistoriales = await HistoriaClinica.count();
        const totalRecetas = await Receta.count();
        const totalCitas = await Cita.count();
        const totalCirugias = await Cirugia.count();
        const totalUsuarios = await Usuario.count();
        const insumos = await InsumoMedico.findAll();
        const bajoStock = insumos.filter(i => i.stock_actual <= i.stock_minimo);

        metricas = {
          label: 'Reporte General',
          metrics: [
            { label: 'Pacientes', value: totalPacientes, color: '#ea5455' },
            { label: 'Citas', value: totalCitas, color: '#ff9f43' },
            { label: 'Recetas', value: totalRecetas, color: '#764ba2' },
            { label: 'Cirugías', value: totalCirugias, color: '#00bcd4' },
            { label: 'Historiales', value: totalHistoriales, color: '#0d6efd' },
            { label: 'Insumos Bajo Stock', value: bajoStock.length, color: '#ea5455' }
          ],
          chartData: [
            { name: 'Pacientes', value: totalPacientes, fill: '#ea5455' },
            { name: 'Citas', value: totalCitas, fill: '#ff9f43' },
            { name: 'Recetas', value: totalRecetas, fill: '#764ba2' },
            { name: 'Cirugías', value: totalCirugias, fill: '#00bcd4' },
            { name: 'Historiales', value: totalHistoriales, fill: '#0d6efd' }
          ]
        };
      } else if (tipo === 'historiales') {
        let query = {};
        if (pacienteId) query.where = { id_paciente: pacienteId };
        const historiales = await HistoriaClinica.findAll(query);

        metricas = {
          label: 'Historiales Clínicos',
          metrics: [
            { label: 'Total', value: historiales.length, color: '#0d6efd' },
            { label: 'Por Analizar', value: Math.ceil(historiales.length * 0.1), color: '#ff9f43' }
          ],
          chartData: [
            { name: 'Total', value: historiales.length, fill: '#0d6efd' },
            { name: 'Por Analizar', value: Math.ceil(historiales.length * 0.1), fill: '#ff9f43' }
          ]
        };
      } else if (tipo === 'citas') {
        const citas = await Cita.findAll();
        const citasCompletadas = citas.filter(c => c.estado_cita === 'COMPLETADA');
        const citasCanceladas = citas.filter(c => c.estado_cita === 'CANCELADA');

        metricas = {
          label: 'Citas Médicas',
          metrics: [
            { label: 'Total', value: citas.length, color: '#ff9f43' },
            { label: 'Completadas', value: citasCompletadas.length, color: '#28c76f' },
            { label: 'Canceladas', value: citasCanceladas.length, color: '#ea5455' }
          ],
          chartData: [
            { name: 'Completadas', value: citasCompletadas.length, fill: '#28c76f' },
            { name: 'Pendientes', value: citas.length - citasCompletadas.length - citasCanceladas.length, fill: '#667eea' },
            { name: 'Canceladas', value: citasCanceladas.length, fill: '#ea5455' }
          ]
        };
      } else if (tipo === 'recetas') {
        const recetas = await Receta.findAll();
        
        // Las recetas recientes (últimos 30 días) se consideran vigentes
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
        const recetasVigentes = recetas.filter(r => {
          const fecha = new Date(r.fecha_receta);
          return fecha >= treintaDiasAtras;
        });

        metricas = {
          label: 'Recetas Médicas',
          metrics: [
            { label: 'Total', value: recetas.length, color: '#764ba2' },
            { label: 'Vigentes', value: recetasVigentes.length, color: '#28c76f' }
          ],
          chartData: [
            { name: 'Vigentes', value: recetasVigentes.length, fill: '#28c76f' },
            { name: 'Vencidas', value: recetas.length - recetasVigentes.length, fill: '#ea5455' }
          ]
        };
      } else if (tipo === 'pacientes') {
        const pacientes = await Paciente.findAll();

        metricas = {
          label: 'Directorio de Pacientes',
          metrics: [
            { label: 'Total', value: pacientes.length, color: '#28c76f' },
            { label: 'Activos', value: pacientes.length, color: '#667eea' }
          ],
          chartData: [
            { name: 'Pacientes', value: pacientes.length, fill: '#28c76f' }
          ]
        };
      } else if (tipo === 'cirugias') {
        const cirugias = await Cirugia.findAll();
        const cirugiasCompletadas = cirugias.filter(c => c.estado_cirugia === 'COMPLETADA');

        metricas = {
          label: 'Cirugías Realizadas',
          metrics: [
            { label: 'Total', value: cirugias.length, color: '#00bcd4' },
            { label: 'Completadas', value: cirugiasCompletadas.length, color: '#28c76f' }
          ],
          chartData: [
            { name: 'Completadas', value: cirugiasCompletadas.length, fill: '#28c76f' },
            { name: 'Pendientes', value: cirugias.length - cirugiasCompletadas.length, fill: '#667eea' }
          ]
        };
      } else if (tipo === 'insumos') {
        const insumos = await InsumoMedico.findAll();
        const bajoStock = insumos.filter(i => i.stock_actual <= i.stock_minimo);
        const activoCount = insumos.filter(i => i.estado === true).length;

        metricas = {
          label: 'Inventario de Insumos',
          metrics: [
            { label: 'Total', value: insumos.length, color: '#9c27b0' },
            { label: 'Activos', value: activoCount, color: '#28c76f' },
            { label: 'Bajo Stock', value: bajoStock.length, color: '#ea5455' }
          ],
          chartData: [
            { name: 'Activos', value: activoCount, fill: '#28c76f' },
            { name: 'Bajo Stock', value: bajoStock.length, fill: '#ea5455' },
            { name: 'Inactivos', value: insumos.length - activoCount - bajoStock.length, fill: '#999999' }
          ]
        };
      } else if (tipo === 'usuarios') {
        const usuarios = await Usuario.findAll({ include: [{ model: Rol, as: 'rol' }] });
        const adminCount = usuarios.filter(u => u.rol?.id_rol === 1).length;
        const medicoCount = usuarios.filter(u => u.rol?.id_rol === 2).length;

        metricas = {
          label: 'Personal del Sistema',
          metrics: [
            { label: 'Total', value: usuarios.length, color: '#03a9f4' },
            { label: 'Administradores', value: adminCount, color: '#ea5455' },
            { label: 'Médicos', value: medicoCount, color: '#667eea' }
          ],
          chartData: [
            { name: 'Administradores', value: adminCount, fill: '#ea5455' },
            { name: 'Médicos', value: medicoCount, fill: '#667eea' },
            { name: 'Otros', value: usuarios.length - adminCount - medicoCount, fill: '#03a9f4' }
          ]
        };
      } else if (tipo === 'educacion') {
        const contenido = await ContenidoEducativo.findAll();
        const activos = contenido.filter(c => (c.estado || 'PUBLICADO') !== 'ARCHIVADO');

        metricas = {
          label: 'Contenido Educativo',
          metrics: [
            { label: 'Total', value: contenido.length, color: '#4caf50' },
            { label: 'Activos', value: activos.length, color: '#28c76f' }
          ],
          chartData: [
            { name: 'Activos', value: activos.length, fill: '#28c76f' },
            { name: 'Inactivos', value: contenido.length - activos.length, fill: '#ea5455' }
          ]
        };
      }

      res.json({
        ok: true,
        data: metricas
      });
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      res.status(500).json({
        ok: false,
        message: 'Error al obtener métricas',
        error: error.message
      });
    }
  },
  generarPDF: async (req, res) => {
    try {
      const { tipo, fechaInicio, fechaFin, pacienteId } = req.body;
      const fs = require('fs');
      const path = require('path');
      const logoPath = path.join(__dirname, '../../..', 'frontend/src/images/logotipo/LOGOTIPO.png');

      // ── STEP 1: Fetch all DB data BEFORE starting the PDF stream ──────────
      let reportData = {};

      if (tipo === 'general') {
        const [totalPacientes, totalHistoriales, totalRecetas, totalCitas, totalCirugias, totalUsuarios, insumos, citas] = await Promise.all([
          Paciente.count(),
          HistoriaClinica.count(),
          Receta.count(),
          Cita.count(),
          Cirugia.count(),
          Usuario.count(),
          InsumoMedico.findAll(),
          Cita.findAll()
        ]);
        const bajoStock = insumos.filter(i => i.stock_actual <= i.stock_minimo);
        const citasCompletadas = citas.filter(c => c.estado_cita === 'COMPLETADA');
        reportData = { totalPacientes, totalHistoriales, totalRecetas, totalCitas, totalCirugias, totalUsuarios, insumos, bajoStock, citas, citasCompletadas };

      } else if (tipo === 'historiales') {
        let query = { include: [{ model: Paciente, as: 'paciente', include: [{ model: Usuario, as: 'usuario' }] }] };
        if (pacienteId) query.where = { id_paciente: pacienteId };
        const historiales = await HistoriaClinica.findAll(query);
        reportData = { historiales };

      } else if (tipo === 'citas') {
        const citas = await Cita.findAll({
          include: [
            { model: Paciente, as: 'paciente', include: [{ model: Usuario, as: 'usuario' }] },
            { model: Medico, as: 'medico', include: [{ model: Usuario, as: 'usuario' }] }
          ]
        });
        reportData = {
          citas,
          citasCompletadas: citas.filter(c => c.estado_cita === 'COMPLETADA'),
          citasCanceladas: citas.filter(c => c.estado_cita === 'CANCELADA')
        };

      } else if (tipo === 'recetas') {
        const recetas = await Receta.findAll({
          include: [
            { model: Paciente, as: 'paciente', include: [{ model: Usuario, as: 'usuario' }] },
            { model: Medico, as: 'medico' }
          ]
        });
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
        reportData = { recetas, recetasVigentes: recetas.filter(r => new Date(r.fecha_receta) >= treintaDiasAtras), treintaDiasAtras };

      } else if (tipo === 'pacientes') {
        const pacientes = await Paciente.findAll({ include: [{ model: Usuario, as: 'usuario' }], order: [['created_at', 'DESC']] });
        reportData = { pacientes };

      } else if (tipo === 'cirugias') {
        const cirugias = await Cirugia.findAll({
          include: [
            { model: Paciente, as: 'paciente', include: [{ model: Usuario, as: 'usuario' }] },
            { model: TipoCirugia, as: 'tipoCirugia' }
          ],
          order: [['fecha_cirugia', 'DESC']]
        });
        reportData = { cirugias, cirugiasCompletadas: cirugias.filter(c => c.estado_cirugia === 'COMPLETADA') };

      } else if (tipo === 'insumos') {
        const insumos = await InsumoMedico.findAll({ include: [{ model: CategoriaInsumo, as: 'categoria' }], order: [['nombre', 'ASC']] });
        const bajoStock = insumos.filter(i => i.stock_actual <= i.stock_minimo);
        reportData = { insumos, bajoStock, activoCount: insumos.filter(i => i.estado === true).length };

      } else if (tipo === 'usuarios') {
        const usuarios = await Usuario.findAll({ include: [{ model: Rol, as: 'rol' }] });
        reportData = {
          usuarios,
          adminCount: usuarios.filter(u => u.rol?.id_rol === 1).length,
          medicoCount: usuarios.filter(u => u.rol?.id_rol === 2).length
        };

      } else if (tipo === 'educacion') {
        const contenido = await ContenidoEducativo.findAll({ include: [{ model: CategoriaEducativa, as: 'categoria' }], order: [['titulo', 'ASC']] });
        reportData = { contenido, activos: contenido.filter(c => (c.estado || 'PUBLICADO') !== 'ARCHIVADO') };
      }

      // ── STEP 2: Data collected - now start PDF stream ───────────────────────
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `reporte_${tipo || 'general'}_${timestamp}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const doc = new PDFDocument({ size: 'A4', margin: 20 });
      doc.pipe(res);

      // Colores del sistema de diseño
      const colors = {
        primary: '#7C3AED',
        secondary: '#DB2777',
        dark: '#0F172A',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#1E293B',
        muted: '#64748B'
      };

      // ── Drawing helpers ──────────────────────────────────────────────────────
      const drawHeader = (titulo) => {
        doc.roundedRect(20, 20, 555, 50, 8).fill(colors.dark);
        try {
          if (fs.existsSync(logoPath)) doc.image(logoPath, 32, 24, { width: 40, height: 40 });
        } catch (e) { /* logo opcional */ }
        doc.fontSize(18).font('Helvetica-Bold').fillColor('white').text('GyneObs', 80, 28);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(colors.secondary).text('Centro Ginecológico y Obstétrico', 80, 50);
        doc.moveTo(20, 75).lineTo(575, 75).strokeColor('#E2E8F0').lineWidth(1).stroke();
        doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.primary).text(titulo.toUpperCase(), 20, 82);
        doc.fontSize(7).font('Helvetica').fillColor(colors.muted).text(
          `Generado: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}`, 20, 95
        );
        return 110;
      };

      const drawMetrics = (metrics, currentY) => {
        const boxWidth = 115, boxHeight = 38, spacing = 8;
        const accentColors = [colors.primary, colors.secondary, colors.success, colors.warning];
        let y = currentY, x = 20;
        metrics.forEach((metric, idx) => {
          if (x + boxWidth > 555) { x = 20; y += boxHeight + spacing; }
          doc.roundedRect(x, y, boxWidth, boxHeight, 6).fill('#F1F5F9');
          doc.rect(x, y, 3, boxHeight).fill(accentColors[idx % accentColors.length]);
          doc.fontSize(13).font('Helvetica-Bold').fillColor(colors.text).text(String(metric.value), x + 8, y + 4, { width: boxWidth - 14 });
          doc.fontSize(6.5).font('Helvetica-Bold').fillColor(colors.muted).text(String(metric.label).toUpperCase(), x + 8, y + 22, { width: boxWidth - 14 });
          x += boxWidth + spacing;
        });
        return y + boxHeight + 8;
      };

      const drawSectionTitle = (title, currentY) => {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.primary).text(title, 20, currentY);
        doc.moveTo(20, currentY + 12).lineTo(575, currentY + 12).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
        return currentY + 18;
      };

      const drawTable = (headers, rows, currentY, colWidths) => {
        const headerHeight = 18, rowHeight = 13, maxY = doc.page.height - 35;
        doc.roundedRect(30, currentY, 535, headerHeight, 4).fill(colors.primary);
        let xPos = 30;
        headers.forEach((h, i) => {
          doc.fontSize(7).font('Helvetica-Bold').fillColor('white').text(h, xPos + 3, currentY + 4, { width: colWidths[i] - 6 });
          xPos += colWidths[i];
        });
        currentY += headerHeight + 1;
        doc.fontSize(6.5).font('Helvetica').fillColor(colors.text);
        rows.forEach((row, ridx) => {
          if (currentY + rowHeight > maxY) {
            doc.addPage();
            currentY = 20;
            doc.roundedRect(20, currentY, 555, headerHeight, 4).fill(colors.primary);
            let xh = 20;
            headers.forEach((h, i) => {
              doc.fontSize(7).font('Helvetica-Bold').fillColor('white').text(h, xh + 3, currentY + 4, { width: colWidths[i] - 6 });
              xh += colWidths[i];
            });
            currentY += headerHeight + 1;
            doc.fontSize(6.5).font('Helvetica').fillColor(colors.text);
          }
          if (ridx % 2 === 0) doc.roundedRect(20, currentY, 555, rowHeight, 2).fill('#F8FAFC');
          xPos = 20;
          row.forEach((cell, cidx) => {
            doc.fillColor(colors.text).text(String(cell ?? 'N/A').substring(0, 35), xPos + 3, currentY + 2, { width: colWidths[cidx] - 6 });
            xPos += colWidths[cidx];
          });
          doc.moveTo(20, currentY + rowHeight).lineTo(575, currentY + rowHeight).strokeColor('#F1F5F9').lineWidth(0.4).stroke();
          currentY += rowHeight;
        });
        return currentY + 6;
      };

      const drawBarChart = (data, currentY, height = 70) => {
        if (!data || data.length === 0) return currentY;
        const validData = data.filter(d => d.value != null && (parseInt(d.value) || 0) > 0);
        if (validData.length === 0) return currentY;
        const maxValue = Math.max(...validData.map(d => parseInt(d.value) || 0));
        if (maxValue === 0) return currentY;
        if (currentY + height + 35 > doc.page.height - 35) { doc.addPage(); currentY = 20; }
        currentY = drawSectionTitle('ANÁLISIS DE DATOS', currentY);
        const barWidth = Math.min(45, 480 / (validData.length * 1.7));
        const spacing = barWidth * 0.5;
        const totalWidth = (barWidth + spacing) * validData.length;
        let xPos = 20 + (555 - totalWidth) / 2;
        const chartY = currentY + height;
        doc.moveTo(20, chartY).lineTo(575, chartY).strokeColor(colors.muted).lineWidth(0.8).stroke();
        validData.forEach((item) => {
          const value = parseInt(item.value) || 0;
          const barH = Math.max(2, (value / maxValue) * height);
          const barY = chartY - barH;
          doc.roundedRect(xPos, barY, barWidth, barH, 3).fill(item.fill || colors.primary);
          doc.fontSize(6).font('Helvetica-Bold').fillColor(colors.text).text(String(value), xPos, barY - 8, { width: barWidth, align: 'center' });
          doc.fontSize(6).font('Helvetica').fillColor(colors.muted).text(String(item.name), xPos - 3, chartY + 3, { width: barWidth + 6, align: 'center' });
          xPos += barWidth + spacing;
        });
        return chartY + 20;
      };

      // ── STEP 3: Build PDF content per type ──────────────────────────────────
      let currentY = 20;

      if (tipo === 'general') {
        const { totalPacientes, totalHistoriales, totalRecetas, totalCitas, totalCirugias, totalUsuarios, insumos, bajoStock, citas, citasCompletadas } = reportData;
        currentY = drawHeader('REPORTE GENERAL');
        currentY = drawMetrics([
          { label: 'Pacientes', value: totalPacientes },
          { label: 'Citas', value: totalCitas },
          { label: 'Recetas', value: totalRecetas },
          { label: 'Cirugías', value: totalCirugias }
        ], currentY);
        currentY = drawSectionTitle('RESUMEN DE ACTIVIDADES', currentY);
        [
          ['Historiales Clínicos', String(totalHistoriales)],
          ['Citas Completadas', String(citasCompletadas.length)],
          ['Insumos en Inventario', String(insumos.length)],
          ['Insumos Bajo Stock', String(bajoStock.length)],
          ['Usuarios del Sistema', String(totalUsuarios)],
          ['Citas / Paciente (ratio)', totalPacientes > 0 ? (totalCitas / totalPacientes).toFixed(1) : '0']
        ].forEach((row, idx) => {
          if (currentY + 14 > doc.page.height - 35) { doc.addPage(); currentY = 20; }
          if (idx % 2 === 0) doc.roundedRect(20, currentY, 555, 13, 2).fill('#F8FAFC');
          doc.fontSize(7.5).font('Helvetica').fillColor(colors.text).text(row[0], 25, currentY + 2, { width: 380 });
          doc.fontSize(7.5).font('Helvetica-Bold').fillColor(colors.primary).text(row[1], 420, currentY + 2, { width: 135, align: 'right' });
          currentY += 14;
        });
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Pacientes', value: totalPacientes, fill: '#ea5455' },
          { name: 'Citas', value: totalCitas, fill: '#ff9f43' },
          { name: 'Recetas', value: totalRecetas, fill: '#764ba2' },
          { name: 'Cirugías', value: totalCirugias, fill: '#00bcd4' },
          { name: 'Historiales', value: totalHistoriales, fill: '#0d6efd' }
        ], currentY);

      } else if (tipo === 'historiales') {
        const { historiales } = reportData;
        currentY = drawHeader('HISTORIALES CLÍNICOS');
        currentY = drawMetrics([
          { label: 'Total', value: historiales.length },
          { label: 'Por Analizar', value: Math.ceil(historiales.length * 0.1) }
        ], currentY);
        currentY = drawSectionTitle('LISTADO DE HISTORIALES', currentY);
        if (historiales.length > 0) {
          const rows = historiales.map((hist, idx) => {
            const u = hist.paciente?.usuario;
            return [
              String(idx + 1),
              u ? `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() : 'N/A',
              String(hist.id_historia_clinica || '').substring(0, 8),
              hist.fecha_apertura ? new Date(hist.fecha_apertura).toLocaleDateString('es-ES') : 'N/A'
            ];
          });
          currentY = drawTable(['#', 'Paciente', 'ID Historial', 'Fecha'], rows, currentY, [30, 260, 150, 125]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Historiales', value: historiales.length, fill: '#667eea' },
          { name: 'Por Analizar', value: Math.ceil(historiales.length * 0.1), fill: '#ff9f43' }
        ], currentY);

      } else if (tipo === 'citas') {
        const { citas, citasCompletadas, citasCanceladas } = reportData;
        currentY = drawHeader('CITAS MÉDICAS');
        currentY = drawMetrics([
          { label: 'Total', value: citas.length },
          { label: 'Completadas', value: citasCompletadas.length },
          { label: 'Canceladas', value: citasCanceladas.length }
        ], currentY);
        currentY = drawSectionTitle('TABLA DE CITAS', currentY);
        if (citas.length > 0) {
          const rows = citas.slice(0, 40).map(c => [
            `${c.paciente?.usuario?.primer_nombre || ''} ${c.paciente?.usuario?.primer_apellido || ''}`.trim() || 'N/A',
            c.fecha_cita ? new Date(c.fecha_cita).toLocaleDateString('es-ES') : 'N/A',
            c.hora_inicio || 'N/A',
            c.estado_cita || 'PROGRAMADA'
          ]);
          currentY = drawTable(['Paciente', 'Fecha', 'Hora', 'Estado'], rows, currentY, [210, 115, 95, 145]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Completadas', value: citasCompletadas.length, fill: '#28c76f' },
          { name: 'Canceladas', value: citasCanceladas.length, fill: '#ea5455' },
          { name: 'Programadas', value: citas.length - citasCompletadas.length - citasCanceladas.length, fill: '#667eea' }
        ], currentY);

      } else if (tipo === 'recetas') {
        const { recetas, recetasVigentes, treintaDiasAtras } = reportData;
        currentY = drawHeader('RECETAS MÉDICAS');
        currentY = drawMetrics([
          { label: 'Total', value: recetas.length },
          { label: 'Vigentes', value: recetasVigentes.length }
        ], currentY);
        currentY = drawSectionTitle('DETALLE DE RECETAS', currentY);
        if (recetas.length > 0) {
          const rows = recetas.map(r => {
            const u = r.paciente?.usuario;
            return [
              String(r.id_receta || '').substring(0, 8),
              u ? `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() : 'N/A',
              r.fecha_receta ? new Date(r.fecha_receta).toLocaleDateString('es-ES') : 'N/A',
              new Date(r.fecha_receta) >= treintaDiasAtras ? 'Vigente' : 'Vencida'
            ];
          });
          currentY = drawTable(['ID', 'Paciente', 'Fecha', 'Estado'], rows, currentY, [70, 255, 130, 120]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Vigentes', value: recetasVigentes.length, fill: '#28c76f' },
          { name: 'Vencidas', value: recetas.length - recetasVigentes.length, fill: '#ea5455' }
        ], currentY);

      } else if (tipo === 'pacientes') {
        const { pacientes } = reportData;
        currentY = drawHeader('DIRECTORIO DE PACIENTES');
        currentY = drawMetrics([
          { label: 'Total', value: pacientes.length },
          { label: 'Activos', value: pacientes.length }
        ], currentY);
        currentY = drawSectionTitle('LISTADO COMPLETO', currentY);
        if (pacientes.length > 0) {
          const rows = pacientes.map(p => {
            const u = p.usuario;
            return [
              u ? `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() : 'N/A',
              u?.ci || 'N/A',
              u?.correo_electronico || 'N/A',
              u?.telefono || 'N/A'
            ];
          });
          currentY = drawTable(['Nombre', 'Cédula', 'Email', 'Teléfono'], rows, currentY, [165, 120, 175, 115]);
        }
        currentY += 4;
        currentY = drawBarChart([{ name: 'Pacientes', value: pacientes.length, fill: '#28c76f' }], currentY);

      } else if (tipo === 'cirugias') {
        const { cirugias, cirugiasCompletadas } = reportData;
        currentY = drawHeader('CIRUGÍAS REALIZADAS');
        currentY = drawMetrics([
          { label: 'Total', value: cirugias.length },
          { label: 'Completadas', value: cirugiasCompletadas.length }
        ], currentY);
        currentY = drawSectionTitle('HISTORIAL DE CIRUGÍAS', currentY);
        if (cirugias.length > 0) {
          const rows = cirugias.map(c => {
            const u = c.paciente?.usuario;
            return [
              u ? `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() : 'N/A',
              c.tipoCirugia?.nombre || c.procedimiento || 'N/A',
              c.fecha_cirugia ? new Date(c.fecha_cirugia).toLocaleDateString('es-ES') : 'N/A',
              c.estado_cirugia || 'PROGRAMADA'
            ];
          });
          currentY = drawTable(['Paciente', 'Tipo Cirugía', 'Fecha', 'Estado'], rows, currentY, [185, 175, 110, 100]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Completadas', value: cirugiasCompletadas.length, fill: '#28c76f' },
          { name: 'Pendientes', value: cirugias.length - cirugiasCompletadas.length, fill: '#667eea' }
        ], currentY);

      } else if (tipo === 'insumos') {
        const { insumos, bajoStock, activoCount } = reportData;
        currentY = drawHeader('INVENTARIO DE INSUMOS');
        currentY = drawMetrics([
          { label: 'Total', value: insumos.length },
          { label: 'Activos', value: activoCount },
          { label: 'Bajo Stock', value: bajoStock.length }
        ], currentY);
        currentY = drawSectionTitle('ESTADO DEL INVENTARIO', currentY);
        if (insumos.length > 0) {
          const rows = insumos.slice(0, 40).map(i => [
            i.nombre || 'N/A',
            i.categoria?.nombre || 'N/A',
            String(i.stock_actual ?? '0'),
            (i.stock_actual || 0) <= (i.stock_minimo || 0) ? 'BAJO' : 'OK'
          ]);
          currentY = drawTable(['Insumo', 'Categoría', 'Stock', 'Estado'], rows, currentY, [230, 165, 80, 100]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Activos', value: activoCount, fill: '#28c76f' },
          { name: 'Bajo Stock', value: bajoStock.length, fill: '#ea5455' },
          { name: 'Inactivos', value: insumos.length - activoCount - bajoStock.length, fill: '#999999' }
        ], currentY);

      } else if (tipo === 'usuarios') {
        const { usuarios, adminCount, medicoCount } = reportData;
        currentY = drawHeader('PERSONAL DEL SISTEMA');
        currentY = drawMetrics([
          { label: 'Total', value: usuarios.length },
          { label: 'Admins', value: adminCount },
          { label: 'Médicos', value: medicoCount }
        ], currentY);
        currentY = drawSectionTitle('DIRECTORIO DE USUARIOS', currentY);
        if (usuarios.length > 0) {
          const rows = usuarios.slice(0, 40).map(u => [
            `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() || 'N/A',
            u.correo_electronico || 'N/A',
            u.rol?.nombre_rol || 'Sin asignar'
          ]);
          currentY = drawTable(['Nombre', 'Email', 'Rol'], rows, currentY, [210, 230, 125]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Administradores', value: adminCount, fill: '#ea5455' },
          { name: 'Médicos', value: medicoCount, fill: '#667eea' },
          { name: 'Otros', value: usuarios.length - adminCount - medicoCount, fill: '#03a9f4' }
        ], currentY);

      } else if (tipo === 'educacion') {
        const { contenido, activos } = reportData;
        currentY = drawHeader('CONTENIDO EDUCATIVO');
        currentY = drawMetrics([
          { label: 'Total', value: contenido.length },
          { label: 'Activos', value: activos.length }
        ], currentY);
        currentY = drawSectionTitle('CATÁLOGO DE MATERIALES', currentY);
        if (contenido.length > 0) {
          const rows = contenido.slice(0, 40).map(c => [
            c.titulo || 'N/A',
            c.categoria?.nombre || c.tipo_contenido || 'N/A',
            (c.estado || 'PUBLICADO') !== 'ARCHIVADO' ? 'Activo' : 'Inactivo'
          ]);
          currentY = drawTable(['Título', 'Categoría', 'Estado'], rows, currentY, [325, 165, 75]);
        }
        currentY += 4;
        currentY = drawBarChart([
          { name: 'Activos', value: activos.length, fill: '#28c76f' },
          { name: 'Inactivos', value: contenido.length - activos.length, fill: '#ea5455' }
        ], currentY);
      }

      // Footer en última página
      const pageHeight = doc.page.height;
      doc.fontSize(7).fillColor(colors.muted)
        .text('Información confidencial — Documento médico protegido', 20, pageHeight - 25, { align: 'center', width: 555 });
      doc.fontSize(7).fillColor(colors.muted)
        .text(`GyneObs | ${new Date().toLocaleDateString('es-ES')}`, 20, pageHeight - 15, { align: 'center', width: 555 });

      doc.end();

    } catch (error) {
      console.error('Error en generarPDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
      }
    }
  },
};
