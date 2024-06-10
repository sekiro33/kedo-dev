

async function setYear(): Promise<void> {
    if (!Context.data.year_string || Context.data.year_string.length < 4) {
        return;
    };
    Context.data.year = Number(Context.data.year_string);
};
