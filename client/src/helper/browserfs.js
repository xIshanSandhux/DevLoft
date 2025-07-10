export const initBrowserFs = async () => {
   return new Promise((resolve, reject) => {
    BrowserFS.install(window);
    BrowserFS.configure({
        fs:"IndexedDB",
        options:{
            name:"DevLoftFileSystem",
            storeName:"files",
            version:1
        }
    },(err)=>{
        if(err){
            console.error("Error initializing BrowserFS:", err);
            reject(err);
        }else{
            console.log("BrowserFS initialized successfully");
            resolve(BrowserFS.BFSRequire("fs"));
        }
    });
   });
};

export const getFS = () => {
    return BrowserFS.BFSRequire('fs');
  };
  
  export const getPath = () => {
    return BrowserFS.BFSRequire('path');
  };
  
  // Helper function to check if IndexedDB is available
  export const isIndexedDBSupported = () => {
    return 'indexedDB' in window;
  };