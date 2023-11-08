class RNMBImageUtils {
  static func createTempFile(_ image: UIImage) -> URL {
    let fileID = UUID().uuidString
    let pathComponent = "Documents/RNMBX-snapshot-\(fileID).png"
    
    let filePath = URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent(pathComponent)
    
    let data = image.pngData()
    try! data?.write(to: filePath, options: [.atomic])
    return filePath
  }
  
  static func createBase64(_ image: UIImage) -> URL {
    let data = image.pngData()
    let b64string : String = data!.base64EncodedString(options: [.endLineWithCarriageReturn])
    let result = "data:image/png;base64,\(b64string)"
    return URL(string: result)!
  }
}

