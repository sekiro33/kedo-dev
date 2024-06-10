async function getFileLink(): Promise<void> {
    if (!Namespace.params.data.goskey_info_file) {
        return;
    };
    ViewContext.data.file_link = await Namespace.params.data.goskey_info_file.getDownloadUrl();
};