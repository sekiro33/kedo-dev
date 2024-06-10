/* Server scripts module */
async function set_file(): Promise<void> {
    if(!Context.data.personal_data_relative)
    Context.data.personal_data_relative = Application.params.data.personal_data_relative
}

