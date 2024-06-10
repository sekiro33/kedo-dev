declare const console: any;

type dataObj = {
    inn: string;
    snils: string;
    name: string;
    surname: string;
    lastname: string;
    phone: string;
    email: string;
    birthDate: string;
    passportSeries: string;
    passportNumber: string;
    passportDate: string;
    issuedBy: string;
    mainPassportPage: string | undefined;
    country: string;
    region: string;
    city: string;
};

let oldData: dataObj;


async function onInit(): Promise<void> {
    oldData = {
        inn: Context.data.inn!,
        snils: Context.data.snils!,
        name: Context.data.name!,
        surname: Context.data.surname!,
        lastname: Context.data.lastname!,
        phone: Context.data.phone![0].tel,
        email: Context.data.email![0].email,
        birthDate: Context.data.birth_date!.format("DD.MM.YYYY"),
        passportSeries: Context.data.passport_series!,
        passportNumber: Context.data.passport_number!,
        passportDate: Context.data.passport_date!.format("DD.MM.YYYY"),
        issuedBy: Context.data.issued_by!,
        mainPassportPage: Context.data.passport_main_page?.id,
        country: Context.data.country!,
        region: Context.data.region!,
        city: Context.data.city!,
    }
};

async function checkDataChange(): Promise<void> {
    Context.data.data_changed = 
        oldData.inn != Context.data.inn! ||
        oldData.snils != Context.data.snils! ||
        oldData.name != Context.data.name! ||
        oldData.surname != Context.data.surname! ||
        oldData.lastname != Context.data.lastname! ||
        oldData.phone != Context.data.phone![0].tel ||
        oldData.email != Context.data.email![0].email ||
        oldData.birthDate != Context.data.birth_date!.format("DD.MM.YYYY") ||
        oldData.passportSeries != Context.data.passport_series! ||
        oldData.passportNumber != Context.data.passport_number! ||
        oldData.passportDate != Context.data.passport_date!.format("DD.MM.YYYY") ||
        oldData.issuedBy != Context.data.issued_by! ||
        oldData.mainPassportPage != Context.data.passport_main_page?.id ||
        oldData.country != Context.data.country! ||
        oldData.region != Context.data.region! ||
        oldData.city != Context.data.city!;
    console.log(oldData)
    console.log(Context.data.data_changed)
}