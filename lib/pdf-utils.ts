import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Helper function to validate base64 image data
const isValidBase64Image = (base64String: string): boolean => {
  try {
    // Check if it's a valid base64 string
    if (!base64String || typeof base64String !== "string") {
      return false
    }

    // Check if it has the data URL prefix
    if (!base64String.startsWith("data:image/")) {
      return false
    }

    // Extract the base64 part
    const base64Data = base64String.split(",")[1]
    if (!base64Data) {
      return false
    }

    // Try to decode the base64 data
    const decoded = atob(base64Data)

    // Check if the decoded data has a reasonable length
    if (decoded.length < 100) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

// Helper function to create a safe placeholder image
const createPlaceholderImage = (): string => {
  // Create a simple 1x1 transparent PNG as base64
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
}

// Helper function to aggressively clean and validate images
const cleanAndValidateImages = async (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll("img")
  const imagesToRemove: HTMLImageElement[] = []

  for (const img of images) {
    try {
      // Check if image source is valid
      if (!img.src || img.src === "" || img.src === "/placeholder.svg") {
        imagesToRemove.push(img)
        continue
      }

      // If it's a base64 image, validate it
      if (img.src.startsWith("data:image/")) {
        if (!isValidBase64Image(img.src)) {
          console.warn("Invalid base64 image detected, removing:", img.src.substring(0, 50) + "...")
          imagesToRemove.push(img)
          continue
        }
      }

      // Check if image has loaded properly
      if (img.complete) {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          console.warn("Image has no dimensions, removing:", img.src.substring(0, 50) + "...")
          imagesToRemove.push(img)
          continue
        }
      } else {
        // Wait for image to load or fail
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn("Image load timeout, removing:", img.src.substring(0, 50) + "...")
            imagesToRemove.push(img)
            img.removeEventListener("load", handleLoad)
            img.removeEventListener("error", handleError)
            resolve()
          }, 2000) // 2 second timeout

          const handleLoad = () => {
            clearTimeout(timeout)
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
              console.warn("Loaded image has no dimensions, removing:", img.src.substring(0, 50) + "...")
              imagesToRemove.push(img)
            }
            img.removeEventListener("load", handleLoad)
            img.removeEventListener("error", handleError)
            resolve()
          }

          const handleError = () => {
            clearTimeout(timeout)
            console.warn("Image failed to load, removing:", img.src.substring(0, 50) + "...")
            imagesToRemove.push(img)
            img.removeEventListener("load", handleLoad)
            img.removeEventListener("error", handleError)
            resolve()
          }

          img.addEventListener("load", handleLoad)
          img.addEventListener("error", handleError)
        })
      }
    } catch (error) {
      console.warn("Error processing image, removing:", error)
      imagesToRemove.push(img)
    }
  }

  // Remove all problematic images
  imagesToRemove.forEach((img) => {
    console.log("Removing problematic image from DOM")
    img.remove()
  })

  // Wait a bit for DOM to settle
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error("Element not found")
  }

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement
  clonedElement.id = elementId + "-clone"
  clonedElement.style.position = "absolute"
  clonedElement.style.left = "-9999px"
  clonedElement.style.top = "0"
  clonedElement.style.display = "block"
  clonedElement.style.visibility = "visible"
  document.body.appendChild(clonedElement)

  try {
    // Hide print-hidden elements and show print-only elements in the clone
    const printHiddenElements = clonedElement.querySelectorAll(".print\\:hidden")
    const printOnlyElements = clonedElement.querySelectorAll(".print\\:block, .print\\:flex, .print\\:grid")

    printHiddenElements.forEach((el) => {
      ;(el as HTMLElement).style.display = "none"
    })

    printOnlyElements.forEach((el) => {
      ;(el as HTMLElement).style.display = "block"
    })

    // Aggressively clean and validate images
    await cleanAndValidateImages(clonedElement)

    // Wait for any remaining async operations
    await new Promise((resolve) => setTimeout(resolve, 300))

    const canvas = await html2canvas(clonedElement, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false, // Changed to false to be more strict
      backgroundColor: "#ffffff",
      logging: false,
      width: clonedElement.scrollWidth,
      height: clonedElement.scrollHeight,
      windowWidth: clonedElement.scrollWidth,
      windowHeight: clonedElement.scrollHeight,
      ignoreElements: (element) => {
        // Skip any remaining problematic elements
        if (element.tagName === "IMG") {
          const img = element as HTMLImageElement
          return !img.src || img.src === "" || img.style.display === "none"
        }
        return false
      },
    })

    const imgData = canvas.toDataURL("image/png", 1.0)
    const pdf = new jsPDF("p", "mm", "a4")

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST")
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST")
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } finally {
    // Remove the cloned element
    document.body.removeChild(clonedElement)
  }
}

export const generateBulkPDF = async (elementIds: string[], filename: string) => {
  if (elementIds.length === 0) {
    throw new Error("No elements to generate PDF from")
  }

  const pdf = new jsPDF("p", "mm", "a4")
  let isFirstPage = true
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const elementId of elementIds) {
    const element = document.getElementById(elementId)
    if (!element) {
      console.warn(`Element with id ${elementId} not found`)
      errorCount++
      errors.push(`Element ${elementId} not found`)
      continue
    }

    try {
      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement
      clonedElement.id = elementId + "-clone"
      clonedElement.style.position = "absolute"
      clonedElement.style.left = "-9999px"
      clonedElement.style.top = "0"
      clonedElement.style.display = "block"
      clonedElement.style.visibility = "visible"
      document.body.appendChild(clonedElement)

      try {
        // Hide print-hidden elements in the clone
        const printHiddenElements = clonedElement.querySelectorAll(".print\\:hidden")
        printHiddenElements.forEach((el) => {
          ;(el as HTMLElement).style.display = "none"
        })

        // Aggressively clean and validate images
        await cleanAndValidateImages(clonedElement)

        // Wait for any remaining async operations
        await new Promise((resolve) => setTimeout(resolve, 300))

        const canvas = await html2canvas(clonedElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: false, // Changed to false to be more strict
          backgroundColor: "#ffffff",
          logging: false,
          width: clonedElement.scrollWidth,
          height: clonedElement.scrollHeight,
          windowWidth: clonedElement.scrollWidth,
          windowHeight: clonedElement.scrollHeight,
          ignoreElements: (element) => {
            // Skip any remaining problematic elements
            if (element.tagName === "IMG") {
              const img = element as HTMLImageElement
              return !img.src || img.src === "" || img.style.display === "none"
            }
            return false
          },
        })

        const imgData = canvas.toDataURL("image/png", 1.0)
        const imgWidth = 210
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (!isFirstPage) {
          pdf.addPage()
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST")
        isFirstPage = false
        successCount++
      } finally {
        // Remove the cloned element
        document.body.removeChild(clonedElement)
      }
    } catch (error) {
      console.error(`Error generating PDF for element ${elementId}:`, error)
      errorCount++
      errors.push(`${elementId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (successCount === 0) {
    throw new Error(`No valid elements found to generate PDF. Errors: ${errors.join(", ")}`)
  }

  // Show summary if there were some errors
  if (errorCount > 0) {
    console.warn(`PDF generated with ${successCount} successful pages and ${errorCount} errors.`)
    console.warn("Errors:", errors)
  }

  pdf.save(filename)

  return {
    successCount,
    errorCount,
    errors,
  }
}
