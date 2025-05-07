
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDate } from "@/utils/dateUtils";

interface ImportTableProps {
  data: any[];
  columns: string[];
}

export function ImportTable({ data, columns }: ImportTableProps) {
  // Show only the first 5 rows for preview
  const previewData = data.slice(0, 5);
  
  return (
    <>
      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {typeof row[column] === 'object' && row[column] instanceof Date 
                      ? formatDate(row[column]) 
                      : row[column]?.toString() || ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.length > 5 && (
        <p className="text-gray-500 mt-2 text-sm text-right">
          Mostrando 5 de {data.length} registros.
        </p>
      )}
    </>
  );
}
