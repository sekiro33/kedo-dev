/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function checkSettingsKEDO(): Promise<void> {
    const setting = await Context.fields.kedo_settings.app.search()
        .where((f, g) => g.and(
            f.__deletedAt.eq(null),
            f.code.eq('director_signing')
        ))
        .first();
    if (setting) {
        Context.data.director_signing = setting.data.status;
    }
}
async function set_line_status(): Promise<void> {
    const job_application = await Context.data.job_application!.fetch();
    job_application.data.line_status = `${job_application.data.__status!.code};${job_application.data.__status!.name}`
    await job_application.save()
}

async function getComment(): Promise<void> {
    try {
        const job_application = await Context.data.job_application!.fetch();
        const signHistory = await job_application.getSignHistory();
        for (let sign of signHistory[0].signs) {
            if (sign.__createdBy.id == Context.data.staff_user!.id) {
                Context.data.comment = sign.comment;
            }
        }
    } catch { }
}

async function setStatusSigning(): Promise<void> {
    if (!Context.data.job_application) {
        throw new Error("Context.data.job_application is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.job_application.namespace,
            code: Context.data.job_application.code,
            id: Context.data.job_application.id,
        },
        status: "signing",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusApproval(): Promise<void> {
    if (!Context.data.job_application) {
        throw new Error("Context.data.job_application is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.job_application.namespace,
            code: Context.data.job_application.code,
            id: Context.data.job_application.id,
        },
        status: "approval",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusSigned(): Promise<void> {
    if (!Context.data.job_application) {
        throw new Error("Context.data.job_application is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.job_application.namespace,
            code: Context.data.job_application.code,
            id: Context.data.job_application.id,
        },
        status: "signed",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function setStatusCancelled(): Promise<void> {
    if (!Context.data.job_application) {
        throw new Error("Context.data.job_application is undefined");
    }

    const obj_status = {
        app: {
            namespace: Context.data.job_application.namespace,
            code: Context.data.job_application.code,
            id: Context.data.job_application.id,
        },
        status: "cancelled",
    };

    Context.data.kedo_status = JSON.stringify(obj_status);
}

async function processingUsersHR(): Promise<void> {
    if (Context.data.hr_dep) {
        Context.data.hr_user = Context.data.hr_dep[Context.data.count_hr!];
        Context.data.count_hr!++;
        if (Context.data.count_hr! <= (Context.data.hr_dep.length - 1)) {
            Context.data.everything_is_done = false;
        } else {
            Context.data.everything_is_done = true;
        }
    }
}

async function interruptFamiliarizationProcesses(): Promise<void> {
    const active_process = await Namespace.processes.reviewing_employment_application._searchInstances()
        .where((f, g) => g.and(
            g.or(
                f.__state.like(ProcessInstanceState.exec),
                f.__state.like(ProcessInstanceState.error),
                f.__state.like(ProcessInstanceState.wait),
            ),
            (f as any)['__item'].eq(Context.data.job_application)
        )).size(100).all();

    if (active_process) {
        active_process.forEach(map => {
            map.interrupt(`С заявлением на трудоустройство ознакомился сотрудник отдела кадров`);
        });
    }
}

async function initializingContext(): Promise<void> {
    Context.data.count_hr = 0;
}
