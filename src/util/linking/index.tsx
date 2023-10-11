import { useRecordContext } from "react-admin";
import Link from '@mui/material/Link';

import { managedProjects, specialUsers } from "../data/groups";

const LinkToUserWithPrefix = (name: string, prefix?: string, linkSuffix?: string) => {
    var topath = "show";
    if ( specialUsers.includes(name) ) {
        if ( prefix ) {
            return prefix + "/" + name;
        } else {
            return name;
        }
    }
    if ( linkSuffix ) {
        topath = topath + "/" + linkSuffix;
    }
    if (prefix) {
        return <Link href={`#/users/${name}/${topath}`}>{prefix + "/" + name}</Link>;
    } else {
        return <Link href={`#/users/${name}/${topath}`}>{name}</Link>;
    }
}

const LinkToGroupWithPrefix = (name: string, prefix?: string, linkSuffix?: string) => {
    var topath = "show";
    if ( linkSuffix ) {
        topath = topath + "/" + linkSuffix;
    }

    if (!(managedProjects.includes(name))) {
        if(prefix) {
            return prefix + "/" + name;
        } else {
            return name;
        }
    }
    if (prefix) {
        return <Link href={`#/groups/${name}/${topath}`}>{prefix + "/" + name}</Link>;
    } else {
        return <Link href={`#/groups/${name}/${topath}`}>{name}</Link>;
    }
}



function LinkToUser() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    if ( 'user' in recordContext ) {
        return LinkToUserWithPrefix(recordContext.user);
    } else if ( 'ownership' in recordContext ) {
        return LinkToUserWithPrefix(recordContext.ownership,"","scratch");
    }
    
}

function LinkToGroup() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    if ( 'project' in recordContext ) {
        return LinkToGroupWithPrefix(recordContext.project);
    } else if ( 'ownership' in recordContext ) {
        return LinkToGroupWithPrefix(recordContext.ownership,"",recordContext.fs);
    }
    
}

function LinkToUserScratch() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    return LinkToUserWithPrefix(recordContext.location,"/scratch","scratch")
}

function LinkToGroupScratch() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    return LinkToGroupWithPrefix(recordContext.location,"/scratch","scratch")
}

function LinkToUserGdata() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    return LinkToUserWithPrefix(recordContext.location,"/g/data","gdata")
}

function LinkToGroupGdata() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    return LinkToGroupWithPrefix(recordContext.location,"/g/data","gdata")
}

export { LinkToUser, LinkToGroup, LinkToGroupGdata, LinkToGroupScratch, LinkToUserScratch, LinkToUserGdata }