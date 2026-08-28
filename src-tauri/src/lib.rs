use base64::Engine;
use std::io::Cursor;
use tauri::{Emitter, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[tauri::command]
fn capture_primary_screen() -> Result<String, String> {
    let screens = screenshots::Screen::all().map_err(|error| error.to_string())?;
    let screen = screens.into_iter().next().ok_or("No display was found")?;
    let image = screen.capture().map_err(|error| error.to_string())?;
    let mut bytes = Cursor::new(Vec::new());
    image::DynamicImage::ImageRgba8(image)
        .write_to(&mut bytes, image::ImageOutputFormat::Png)
        .map_err(|error| error.to_string())?;
    Ok(format!("data:image/png;base64,{}", base64::engine::general_purpose::STANDARD.encode(bytes.into_inner())))
}

#[tauri::command]
fn copy_text(text: String) -> Result<(), String> {
    arboard::Clipboard::new()
        .and_then(|mut clipboard| clipboard.set_text(text))
        .map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new()
            .with_handler(|app, _shortcut, event| {
                if event.state() == ShortcutState::Pressed {
                    let _ = app.emit("capture-requested", ());
                }
            })
            .build())
        .setup(|app| {
            app.global_shortcut().register("CommandOrControl+Shift+2")?;
            let capture = MenuItem::with_id(app, "capture", "Capture region", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show Screen Text Drop", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&capture, &show, &quit])?;
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().cloned().expect("app icon"))
                .tooltip("Screen Text Drop — local OCR")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "capture" => { let _ = app.emit("capture-requested", ()); },
                    "show" => { if let Some(window) = app.get_webview_window("main") { let _ = window.show(); let _ = window.set_focus(); } },
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        if let Some(window) = tray.app_handle().get_webview_window("main") { let _ = window.show(); let _ = window.set_focus(); }
                    }
                })
                .build(app)?;
            std::mem::forget(tray);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![capture_primary_screen, copy_text])
        .run(tauri::generate_context!())
        .expect("error while running Screen Text Drop");
}
