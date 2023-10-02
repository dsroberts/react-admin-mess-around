import { Show, SimpleShowLayout, TextField, useRecordContext, TopToolbar, PrevNextButtons, ReferenceManyField, Datagrid, FunctionField } from 'react-admin';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';

function LinkToGroup() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    return <Link href={`#/groups/${recordContext.project}/show`}>{recordContext.project}</Link>
}

const PostTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{record.pw_name} ({record.id})</span>
}

const TagsField = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <div>
            {record.groups.map(item => (
                <Chip label={item} component="a" href={`#/groups/${item}/show`} clickable/>
            ))}
        </div>
    )
};

export const UserPage = () => {

    return (
        <Show title={<PostTitle/>} actions={
            <TopToolbar>
                <PrevNextButtons linkType="show"/>
            </TopToolbar>}>
            <SimpleShowLayout>
                <TextField source="id" label="Username" />
                <TextField source="pw_name" label="Name" />
                <TagsField label="Projects"/>
                <ReferenceManyField label="Compute usage in Projects" target="user" reference="compute_latest">
                    <Datagrid bulkActionButtons={false}>
                        <FunctionField label="Project" render={LinkToGroup} sortBy="project" source="project"/>
                        <FunctionField label="SU Usage" render={record => `${record.usage} SU`} sortBy='usage' source='usage'/>
                    </Datagrid>
                </ReferenceManyField>
            </SimpleShowLayout>
            
        </Show>
    )
};