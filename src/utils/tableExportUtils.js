// tableExportUtils.js - Utilidades para exportar datos de tablas

// EXPORTAR A CSV
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  try {
    // Crear headers
    const headers = columns.map(col => col.header).join(',');
    
    // Crear filas
    const rows = data.map(row => {
      return columns.map(col => {
        let value = col.accessor(row);
        
        // Limpiar valor para CSV
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Escapar comillas y agregar comillas si contiene coma o salto de línea
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
        
        return value;
      }).join(',');
    });
    
    // Combinar headers y rows
    const csv = [headers, ...rows].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
    
    return { success: true, message: 'Exportado correctamente' };
  } catch (error) {
    console.error('Error exportando a CSV:', error);
    return { success: false, message: 'Error al exportar' };
  }
};

// EXPORTAR A JSON
export const exportToJSON = (data, columns, filename = 'export.json') => {
  try {
    // Transformar data usando los accessors de las columnas
    const exportData = data.map(row => {
      const obj = {};
      columns.forEach(col => {
        obj[col.key] = col.accessor(row);
      });
      return obj;
    });
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, filename);
    
    return { success: true, message: 'Exportado correctamente' };
  } catch (error) {
    console.error('Error exportando a JSON:', error);
    return { success: false, message: 'Error al exportar' };
  }
};

// COPIAR AL PORTAPAPELES
export const copyToClipboard = async (data, columns) => {
  try {
    // Crear texto con formato de tabla
    const headers = columns.map(col => col.header).join('\t');
    const rows = data.map(row => {
      return columns.map(col => {
        let value = col.accessor(row);
        return value !== null && value !== undefined ? String(value) : '';
      }).join('\t');
    });
    
    const text = [headers, ...rows].join('\n');
    
    await navigator.clipboard.writeText(text);
    
    return { success: true, message: 'Copiado al portapapeles' };
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    return { success: false, message: 'Error al copiar' };
  }
};

// HELPER: DESCARGAR BLOB
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// EXPORTAR A EXCEL (convertido a CSV automáticamente)
export const exportToExcel = async (data, columns, filename = 'export.xlsx') => {
  // Como xlsx tiene vulnerabilidades, siempre exportamos a CSV
  console.info('Exportando a CSV en lugar de Excel por seguridad');
  return exportToCSV(data, columns, filename.replace('.xlsx', '.csv'));
};

// IMPRIMIR TABLA
export const printTable = (data, columns, title = 'Reporte') => {
  try {
    const headers = columns.map(col => col.header).join('</th><th>');
    const rows = data.map(row => {
      const cells = columns.map(col => {
        let value = col.accessor(row);
        return value !== null && value !== undefined ? String(value) : '';
      }).join('</td><td>');
      return `<tr><td>${cells}</td></tr>`;
    }).join('');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generado el: ${new Date().toLocaleString('es-AR')}</p>
          <table>
            <thead>
              <tr><th>${headers}</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
    
    return { success: true, message: 'Abriendo vista de impresión' };
  } catch (error) {
    console.error('Error imprimiendo tabla:', error);
    return { success: false, message: 'Error al imprimir' };
  }
};

// Exportar funciones
export default {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  copyToClipboard,
  printTable
};