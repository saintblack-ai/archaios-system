import SwiftUI

struct ArchaiosTheme: Equatable {
    let name: String
    let background: Color
    let panel: Color
    let elevatedPanel: Color
    let heading: Color
    let text: Color
    let accent: Color
    let success: Color
    let warning: Color
    let danger: Color

    static let command = ArchaiosTheme(
        name: "Command",
        background: Color(red: 0.025, green: 0.027, blue: 0.032),
        panel: Color(red: 0.075, green: 0.080, blue: 0.092),
        elevatedPanel: Color(red: 0.105, green: 0.112, blue: 0.130),
        heading: Color(red: 0.94, green: 0.73, blue: 0.32),
        text: Color(red: 0.93, green: 0.94, blue: 0.91),
        accent: Color(red: 0.94, green: 0.73, blue: 0.32),
        success: Color(red: 0.06, green: 0.78, blue: 0.48),
        warning: Color(red: 0.93, green: 0.62, blue: 0.16),
        danger: Color(red: 0.92, green: 0.18, blue: 0.23)
    )

    static let vault = ArchaiosTheme(
        name: "Black Vault",
        background: Color.black,
        panel: Color(red: 0.055, green: 0.060, blue: 0.070),
        elevatedPanel: Color(red: 0.100, green: 0.095, blue: 0.080),
        heading: Color(red: 1.00, green: 0.80, blue: 0.38),
        text: Color(red: 0.95, green: 0.94, blue: 0.90),
        accent: Color(red: 1.00, green: 0.78, blue: 0.30),
        success: Color(red: 0.09, green: 0.80, blue: 0.52),
        warning: Color(red: 0.95, green: 0.63, blue: 0.18),
        danger: Color(red: 0.94, green: 0.16, blue: 0.22)
    )
}
