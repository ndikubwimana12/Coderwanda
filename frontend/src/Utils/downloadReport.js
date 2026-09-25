import api from './api';
export async function downloadReport(resource) {
  const { data } = await api.get(`/admin/reports/export/${resource}`, { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a'); link.href = url; link.download = `coderwanda-${resource}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
