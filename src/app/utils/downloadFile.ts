export function downloadFile(
  data: string,
  datatype: string,
  filename: string,
  fileEnding: string,
  encodeUri: boolean = true,
) {
  const element = document.createElement('a');
  const dataToAdd = encodeUri ? encodeURIComponent(data) : data;
  element.setAttribute('href', datatype + dataToAdd);
  element.setAttribute('download', filename + fileEnding);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  element.remove();
}
