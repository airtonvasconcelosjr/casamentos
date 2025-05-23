export function formatPhoneNumber(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");

    if (digits.length <= 2) {
        return `(${digits}`;
    }

    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    if (digits.length <= 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    // Caso exceda 11 dígitos, corta o excesso
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}


export function formatDateBR(dateInput) {
  if (!dateInput) return "";

  if (typeof dateInput === "object" && typeof dateInput.toDate === "function") {
    const date = dateInput.toDate();
    return date.toLocaleDateString("pt-BR");
  }

  if (dateInput instanceof Date) {
    return dateInput.toLocaleDateString("pt-BR");
  }

  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.split("-");
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  return "—";
}


export function formatDateTimeBR(isoDateTime) {
  if (!isoDateTime) return "";
  const [date, time] = isoDateTime.split("T");
  return `${formatDateBR(date)} ${time}`;
}

export function formatInputDateMask(value) {
  const digits = value.replace(/[^\d]/g, '');

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export function parseDateToBRFormat(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function parseDateFromBRFormat(brDate) {
  if (!brDate) return "";
  const [day, month, year] = brDate.split("/");
  return `${year}-${month}-${day}`;
}

export function formatCurrencyBR(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export const calculateDaysRemaining = (weddingDate) => {
  if (!weddingDate) return { text: 'N/A', className: '' };

  try {
    let wedding;
    if (weddingDate?.seconds) {
      wedding = new Date(weddingDate.seconds * 1000);
    } else if (weddingDate instanceof Date) {
      wedding = new Date(weddingDate);
    } else if (typeof weddingDate === 'string') {
      wedding = new Date(weddingDate);
    } else {
      return { text: 'N/A', className: '' };
    }

    if (isNaN(wedding.getTime())) {
      return { text: 'Data inválida', className: 'text-red-500' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (wedding < today) return { text: 'Realizado', className: 'text-gray-500' };

    const diffTime = wedding - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let className = '';
    if (diffDays <= 7) className = 'text-red-600 font-bold';
    else if (diffDays <= 30) className = 'text-yellow-600 font-semibold';

    return {
      text: `${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
      className
    };
  } catch (error) {
    console.error('Erro ao calcular dias restantes:', error);
    return { text: 'Erro', className: 'text-red-500' };
  }
};
