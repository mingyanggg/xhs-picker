use tauri::{Emitter, WebviewWindow};

#[tauri::command]
fn extract_page_data(window: WebviewWindow) -> Result<String, String> {
    let script = "(function(){var d={notes:[],keyword:'',url:location.href};try{var s=window.__INITIAL_STATE__||{};var items=s.noteSearch?.items||s.search?.notes||[];if(items.length>0){d.notes=items.slice(0,20).map(function(i){var n=i.note||i;var e=n.interactionInfo||n;return{id:n.id||'',title:n.title||n.displayTitle||'',likes:e.likedCount||e.liked_count||0,collects:e.collectedCount||e.collected_count||0,comments:e.commentCount||e.comment_count||0,shares:e.shareCount||e.share_count||0,author:(n.user?.nickname||n.creator?.nickname||''),url:n.id?'https://www.xiaohongshu.com/discovery/item/'+n.id:''}}).filter(function(c){return c.id})};var m=location.href.match(/keyword=([^&]+)/);if(m)d.keyword=decodeURIComponent(m[1]);if(d.notes.length===0)d.error='need_login'}catch(e){d.error=e.message}window.__TAURI__.event.emit('page-data',d)})()";
    window.eval(script).map_err(|e| e.to_string())?;
    Ok("ok".to_string())
}

#[tauri::command]
fn get_webview_url(window: WebviewWindow) -> String {
    window.url().map(|u| u.to_string()).unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![extract_page_data, get_webview_url])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
