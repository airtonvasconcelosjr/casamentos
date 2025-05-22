import jsPDF from "jspdf";
import { formatDateBR, formatCurrencyBR } from "./formatters";

export async function generateOrcamentoPdf(orcamento) {
    const doc = new jsPDF();

    const primaryColor = [46, 64, 55];
    const margin = 14;
    let y = 0;

    await addHeader(doc);
    y = 50;

    drawDivider(doc, y, primaryColor);
    y += 12;

    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO DO ORÇAMENTO", margin, y);
    doc.setFont("helvetica", "normal");
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const col1 = margin;
    const col2 = 120;
    doc.text(`Nome da Noiva: ${orcamento.nomeNoiva || "-"}`, col1, y);
    doc.text(`Nome do Noivo: ${orcamento.nomeNoivo || "-"}`, col1, y + 8);
    doc.text(`Cliente: ${orcamento.cliente?.nome || "-"}`, col1, y + 16);
    doc.text(`Email: ${orcamento.cliente?.email || "-"}`, col1, y + 24);


    doc.text(`Data de Criação: ${formatDateBR(orcamento.dataCriacao)}`, col2, y);
    doc.text(`Data do Casamento: ${formatDateBR(orcamento.dataCasamento)}`, col2, y + 8);
    doc.text(`Nº de Convidados: ${orcamento.numeroConvidados || 0}`, col2, y + 16);
    doc.text(`Status: ${orcamento.status || "-"}`, col2, y + 24);

    y += 32;

    drawDivider(doc, y, primaryColor);
    y += 12;

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`VALOR TOTAL: ${formatCurrencyBR(orcamento.valorTotalConfirmado)}`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("SERVIÇOS CONTRATADOS:", margin, y);
    doc.setFont("helvetica", "normal");
    y += 15;

    const servicos = orcamento.servicos || {};
    const servicosList = [
        { nome: "Assessoria/Cerimonial", key: "assessoriaCerimonial" },
        { nome: "Igreja", key: "igreja" },
        { nome: "Local Recepção", key: "localRecepcao" },
        { nome: "Buffet", key: "buffet" },
        { nome: "Decoração", key: "decoracao" },
        { nome: "Música", key: "musica" },
        { nome: "Convites", key: "convites" },
        { nome: "Outros", key: "outros" }
    ];

    doc.setFillColor(...primaryColor);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, 170, 8, 'F');
    doc.text("Serviço", margin + 2, y + 6);
    doc.text("Descrição", 70, y + 6);
    doc.text("Valor", 160, y + 6);
    y += 10;

    doc.setTextColor(0, 0, 0);
    servicosList.forEach(item => {
        const servico = servicos[item.key] || {};
        if (servico.descricao || servico.valor) {

            const serviceNameLines = doc.splitTextToSize(item.nome, 50);
            doc.text(serviceNameLines, col1 + 2, y + 6);

            const descLines = doc.splitTextToSize(servico.descricao || "-", 70);
            doc.text(descLines, 70, y + 6);

            doc.text(formatCurrencyBR(servico.valor || 0), 160, y + 6);

            const lineHeight = Math.max(serviceNameLines.length, descLines.length) * 6;

            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y + lineHeight + 2, margin + 170, y + lineHeight + 2);
            y += lineHeight + 4;
        }
    });

    addFooter(doc, primaryColor);

    doc.save(`Orçamento_${orcamento.nomeNoiva || "Casamento"}.pdf`);
}

async function addHeader(doc) {
    const primaryColor = [46, 64, 55];
    let y = 15;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    doc.text("Casar em Carneiros", 14, y);
    y += 6;
    doc.text("Assessoria Completa para Casamentos", 14, y);
    y += 6;
    doc.text("Rua das Flores, 123 - Jardim Primavera", 14, y);
    y += 6;
    doc.text("São Paulo/SP - CEP: 01234-567", 14, y);
    y += 6;
    doc.text("Tel: (11) 98765-4321 | contato@casaremcarneiros.com.br", 14, y);
    y += 6;
    doc.text("www.casaremcarneiros.com.br", 14, y);
    y += 10;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, y, 200, y);

    return y + 15;
}
function addFooter(doc, primaryColor) {
    const pageHeight = doc.internal.pageSize.height;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 25, 200, pageHeight - 25);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    doc.text("Casar em Carneiros - Assessoria Completa", 14, pageHeight - 20);
    doc.text("www.casaremcarneiros.com.br", 14, pageHeight - 15);

    doc.text("Página 1 de 1", 190, pageHeight - 15, { align: "right" });
}

function drawDivider(doc, y, color) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(14, y, 200, y);
}
