import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function GradingScale() {
  return (
    <div className="mt-6 pt-4 border-t-2 border-gray-800 flex flex-col items-center">
      <h3 className="text-base font-bold text-center mb-3 uppercase">GRADING SCALE</h3>

      <Table className="w-auto border-2 border-gray-800 mx-auto">
        <TableHeader>
          <TableRow className="bg-gray-200 print:bg-gray-100">
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">GRADE</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">D1</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">D2</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">C3</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">C4</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">C5</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">C6</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">P7</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">P8</TableHead>
            <TableHead className="text-center font-bold border border-gray-400 px-3 py-2">F9</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-center font-bold border border-gray-400 px-3 py-2">MARKS</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">95-100</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">80-94</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">70-79</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">65-69</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">60-64</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">55-59</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">50-54</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">40-49</TableCell>
            <TableCell className="text-center font-medium border border-gray-400 px-3 py-2">0-39</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
