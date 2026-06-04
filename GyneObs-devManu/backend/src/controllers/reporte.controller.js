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
};