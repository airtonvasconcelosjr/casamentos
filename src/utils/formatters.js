export function formatPhoneNumber(phone) {
  if (!phone) return "—";
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function formatDateBR(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
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


