// ExportMenu.jsx - Menú desplegable para exportar datos en diferentes formatos
import { useState } from 'react';
import { Download } from 'lucide-react';
import { 
  exportToCSV, 
  exportToJSON, 
  exportToExcel,
  copyToClipboard,
  printTable
} from '../../utils/tableExportUtils';

const ExportMenu = ({ data, columns, filename = 'export' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleExport = async (type) => {
    let result;
    
    switch (type) {
      case 'csv':
        result = exportToCSV(data, columns, `${filename}.csv`);
        break;
      case 'json':
        result = exportToJSON(data, columns, `${filename}.json`);
        break;
      /*case 'excel':
        result = await exportToExcel(data, columns, `${filename}.xlsx`);
        break;*/
      case 'copy':
        result = await copyToClipboard(data, columns);
        break;
      case 'print':
        result = printTable(data, columns, filename);
        break;
      default:
        return;
    }
    
    setMessage(result);
    setTimeout(() => setMessage(null), 3000);
    setShowMenu(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-primary"
      >
        <Download className="w-4 h-4" />
        <span className="hidden md:inline">Exportar</span>
      </button>
      
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border-2 border-gray-100 py-2 z-20">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
            >
              📄 Exportar CSV
            </button>
            {/*<button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
            >
              📊 Exportar CSV (Excel)
            </button>*/}
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
            >
              📋 Exportar JSON
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => handleExport('copy')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
            >
              📎 Copiar al portapapeles
            </button>
            <button
              onClick={() => handleExport('print')}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
            >
              🖨️ Imprimir
            </button>
          </div>
        </>
      )}
      
      {message && (
        <div className={`absolute right-0 mt-2 px-4 py-2 rounded-lg text-sm font-medium z-30 ${
          message.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.message}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;