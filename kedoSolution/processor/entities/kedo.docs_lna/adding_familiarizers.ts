/**
Here you can write scripts for complex server processing of the context during process execution.
To write scripts, use TypeScript (https://www.typescriptlang.org).
ELMA365 SDK documentation available on https://tssdk.elma365.com.
**/

async function findFamiliazing(): Promise<void> {
    if (Context.data.familiarizing == undefined) {
        Context.data.familiarizing = []
    }
    if (Context.data.organization) {
        Context.data.familiarizing = Context.data.familiarizing.concat(await Context.fields.familiarizing.app.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.organization.link(Context.data.organization!))).size(10000).all())
    }
    if (Context.data.structural_subdivision) {
        Context.data.familiarizing = Context.data.familiarizing.concat(await Context.fields.familiarizing.app.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.structural_subdivision.link(Context.data.structural_subdivision!))).size(10000).all())
    }
    if (Context.data.include_child_units && Context.data.structural_subdivision) {
        let divisions = await Context.fields.structural_subdivision.app.search().where((f, g) => g.and(f.__deletedAt.eq(null), f.subdivision.link(Context.data.structural_subdivision!))).size(10000).all();
        if (divisions && divisions.length > 0) {
            for (let i = 0; i < divisions.length; i++) {
                let division = divisions[i];
                Context.data.familiarizing = Context.data.familiarizing.concat(await Context.fields.familiarizing.app.search().where((f,g)=>g.and(f.__deletedAt.eq(null), f.structural_subdivision.link(division))).size(10000).all())
            }
        }
    }
}


async function checkAndTakeItem(): Promise<boolean> {
    if (Context.data.familiarizing && Context.data.familiarizing.length > 0) {
        Context.data.current_staff_familiarizing = Context.data.familiarizing.shift();
        return true;
    }
    return false;
}

async function incrementCountWorkflows(): Promise<void> {
    Context.data.count_workflows!++;
    if (Context.data.count_workflows! > 90) {
        Context.data.count_workflows = 0;
    }
}

async function isCountHundred(): Promise<boolean> {
    if (Context.data.count_workflows! > 90) {
        return true;
    } else {
        return false;
    }
}

async function get_all_users(): Promise<void> {
    Context.data.users = [];
    let users : UserItemRef[]= [];
    if (Context.data.familiarizing && Context.data.familiarizing.length > 0) {
       let users_fetch = await Promise.all(Context.data.familiarizing.map(item=>item.fetch()));
       users_fetch.map(item=>{
        if(item.data.ext_user){
            users.push(item.data.ext_user);
        }});
        Context.data.users = Context.data.users.concat(users!)
    }
}
