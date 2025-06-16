import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error("Element not found")
  }

  // Hide print-hidden elements and show print-only elements
  const printHiddenElements = document.querySelectorAll(".print\\:hidden")
  const printOnlyElements = document.querySelectorAll(".print\\:block, .print\\:flex, .print\\:grid")

  printHiddenElements.forEach((el) => {
    ;(el as HTMLElement).style.display = "none"
  })

  printOnlyElements.forEach((el) => {
    ;(el as HTMLElement).style.display = "block"
  })

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } finally {
    // Restore original display styles
    printHiddenElements.forEach((el) => {
      ;(el as HTMLElement).style.display = ""
    })

    printOnlyElements.forEach((el) => {
      ;(el as HTMLElement).style.display = ""
    })
  }
}

export const generateBulkPDF = async (elementIds: string[], filename: string) => {
  const pdf = new jsPDF("p", "mm", "a4")
  let isFirstPage = true

  for (const elementId of elementIds) {
    const element = document.getElementById(elementId)
    if (!element) continue

    // Hide print-hidden elements
    const printHiddenElements = document.querySelectorAll(".print\\:hidden")
    printHiddenElements.forEach((el) => {
      ;(el as HTMLElement).style.display = "none"
    })

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
      })

      const imgData = canvas.toDataURL("image/png")
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (!isFirstPage) {
        pdf.addPage()
      }

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      isFirstPage = false
    } finally {
      // Restore original display styles
      printHiddenElements.forEach((el) => {
        ;(el as HTMLElement).style.display = ""
      })
    }
  }

  pdf.save(filename)
}
