import jsPDF from "jspdf";
import { PDFDocument } from 'pdf-lib';
import { formatDateBR, formatCurrencyBR } from "./formatters";

export async function generateOrcamentoPdf(orcamento) {
    try {
        await generateCompletePdf(orcamento);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        await fallbackGenerateOrcamento(orcamento);
    }
}

async function generateCompletePdf(orcamento) {
    const doc = new jsPDF();
    const primaryColor = [46, 64, 55];

    await generateCoverPage(doc, orcamento, primaryColor);

    doc.addPage();
    await generateOrcamentoPageIntegrated(doc, orcamento, primaryColor);

    doc.addPage();
    generateThankYouPage(doc, primaryColor);

    const filename = `Orçamento_Completo_${orcamento.nomeNoiva || "Casamento"}.pdf`;
    doc.save(filename);
    console.log('PDF completo gerado com sucesso!');
}

async function generateCoverPage(doc, orcamento, primaryColor) {
    const margin = 20;
    let y = 40;

    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Casar em Carneiros", margin, y);

    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Assessoria Completa para Casamentos", margin, y);

    y += 30;

    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("ORÇAMENTO", margin, y);

    y += 15;
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(`${orcamento.nomeNoiva || "Noiva"} & ${orcamento.nomeNoivo || "Noivo"}`, margin, y);

    y += 40;

    doc.setFillColor(240, 248, 243);
    doc.rect(margin, y, 170, 60, 'F');

    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Data do Casamento:", margin + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(formatDateBR(orcamento.dataCasamento), margin + 60, y);

    y += 10;
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Nº de Convidados:", margin + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(String(orcamento.numeroConvidados || 0), margin + 60, y);

    y += 10;
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Valor Total:", margin + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyBR(orcamento.valorTotalConfirmado), margin + 60, y);

    y = 250;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("www.casaremcarneiros.com.br | (11) 98765-4321", margin, y);
    doc.text("contato@casaremcarneiros.com.br", margin, y + 5);
}

async function generateOrcamentoPageIntegrated(doc, orcamento, primaryColor) {
    const margin = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("DETALHAMENTO DO ORÇAMENTO", margin, y);
    y += 20;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    const col1 = margin;
    const col2 = 120;

    doc.text(`Cliente: ${orcamento.cliente?.nome || "-"}`, col1, y);
    doc.text(`Email: ${orcamento.cliente?.email || "-"}`, col2, y);
    y += 8;
    doc.text(`Telefone: ${orcamento.cliente?.telefone || "-"}`, col1, y);
    doc.text(`Data de Criação: ${formatDateBR(orcamento.dataCriacao)}`, col2, y);
    y += 8;
    doc.text(`Status: ${orcamento.status || "-"}`, col1, y);

    y += 20;

    drawDivider(doc, y, primaryColor);
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("SERVIÇOS CONTRATADOS:", margin, y);
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

    y += 10;
    doc.setFillColor(240, 248, 243);
    doc.rect(margin, y, 170, 15, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`VALOR TOTAL: ${formatCurrencyBR(orcamento.valorTotalConfirmado)}`, margin + 10, y + 10);

    addFooter(doc, primaryColor);
}

function generateThankYouPage(doc, primaryColor) {
    const margin = 20;
    let y = 80;

    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Muito Obrigado!", 105, y, { align: "center" });

    y += 40;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    const thankYouText = [
        "Agradecemos por fazer parte deste momento tão especial.",
        "",
        "Casar em Carneiros não é apenas uma cerimônia, é uma experiência",
        "inesquecível ao lado das pessoas que amamos.",
        "",
        "Que cada lembrança vivida aqui traga calor ao coração por toda a vida.",
        "",
        "",
        "Com carinho,",
        "Equipe Casar em Carneiros"
    ];

    thankYouText.forEach(line => {
        if (line === "") {
            y += 10;
        } else if (line === "Com carinho," || line === "Equipe Casar em Carneiros") {
            doc.setFont("helvetica", "italic");
            doc.text(line, 105, y, { align: "center" });
            y += 12;
        } else {
            doc.setFont("helvetica", "normal");
            doc.text(line, 105, y, { align: "center" });
            y += 12;
        }
    });

    y += 30;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(60, y, 150, y);

    y += 20;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("www.casaremcarneiros.com.br", 105, y, { align: "center" });
    y += 8;
    doc.text("(11) 98765-4321", 105, y, { align: "center" });
}

async function generateOrcamentoPage(orcamento) {
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

    return doc.output('arraybuffer');
}


async function fallbackGenerateOrcamento(orcamento) {
    try {
        console.log('Executando fallback - gerando PDF apenas com orçamento');
        const orcamentoPdfBytes = await generateOrcamentoPage(orcamento);
        downloadPdf(orcamentoPdfBytes, `Orçamento_${orcamento.nomeNoiva || "Casamento"}.pdf`);
        console.log('PDF fallback gerado com sucesso!');
    } catch (error) {
        console.error('Erro no fallback:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
    }
}

function downloadPdf(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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