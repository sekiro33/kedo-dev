/* Client scripts module */

interface StaffInfo {
    LastName: string;
    FirstName: string;
    FatherName: string;
    DateOfBirth: string;
    YearsOld: number;
    Phone: string;
    Login: string;
    Password: string;
    Email: string;
    Gender: string;
    GenderCode: string;
    PasportNum: string;
    PasportSerial: string;
    PasportNumber: number;
    PasportCode: string;
    PasportOtd: string;
    PasportDate: string;
    inn_fiz: string;
    inn_ur: string;
    snils: string;
    oms: number;
    ogrn: string;
    kpp: number;
    Address: string;
    AddressReg: string;
    Country: string;
    Region: string;
    City: string;
    Street: string;
    House: number;
    Apartment: number;
    bankBIK: number;
    bankCorr: string;
    bankINN: number;
    bankKPP: number;
    bankNum: string;
    bankClient: string;
    bankCard: string;
    bankDate: string;
    bankCVC: number;
    EduSpecialty: string;
    EduProgram: string;
    EduName: string;
    EduDocNum: string;
    EduRegNumber: string;
    EduYear: number;
    CarBrand: string;
    CarModel: string;
    CarYear: number;
    CarColor: string;
    CarNumber: string;
    CarVIN: string;
    CarSTS: string;
    CarSTSDate: string;
    CarPTS: string;
    CarPTSDate: string;
}

async function random_fill(): Promise<void> {
    const data = await get_data();

    if (data) {
        const user = await System.users.getCurrentUser();
        await set_fields(data, user);
    }
}

async function set_fields(data: StaffInfo, user: UserItem): Promise<void> {
    Context.data.name = data.FirstName;
    Context.data.middlename = data.FatherName;
    Context.data.surname = data.LastName;

    Context.data.date_of_birth = new Datetime(data.DateOfBirth, "DD.MM.YYYY").getDate();
    Context.data.phone = {
        tel: "+" + data.Phone.replace(/\D/g, ''),
        type: PhoneType.Work
    };

    const email = user.data.email ?
        `${user.data.email.split('@')[0]}+${new Datetime().format("DDMMYYYHHmm")}@${user.data.email.split('@')[1]}` :
        data.Email;

    Context.data.email = {
        email: email,
        type: EmailType.Work
    };
    Context.data.sex = data.Gender == 'man' ? false : true;
    Context.data.passport_series = data.PasportSerial;
    Context.data.passport_number = String(data.PasportNumber);
    Context.data.passport_department_code = data.PasportCode;
    Context.data.russian_passport = true;
    Context.data.issued_by = data.PasportOtd;
    Context.data.date_of_issue = new Datetime(data.PasportDate, "DD.MM.YYYY").getDate();
    Context.data.inn = data.inn_fiz;
    const snils = String(data.snils);
    Context.data.snils = `${snils.substring(0, 3)}-${snils.substring(3, 6)}-${snils.substring(6, 9)} ${snils.substring(9, 11)}`;

    Context.data.city = data.City;
    Context.data.street = data.Street;
    Context.data.home = String(data.House);
}

async function get_data(): Promise<StaffInfo | undefined> {
    const response = await fetch('https://api.randomdatatools.ru', {
        method: "GET",
    });

    if (response.ok) {
        const data: StaffInfo = await response.json();
        return data;
    }

    return undefined;
}