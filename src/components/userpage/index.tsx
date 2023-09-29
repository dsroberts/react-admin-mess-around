import { Show, SimpleShowLayout, TextField, useRecordContext, TopToolbar, PrevNextButtons, useGetOne, FunctionField, ReferenceManyField, NumberField, Datagrid } from 'react-admin';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const PostTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{record.pw_name} ({record.id})</span>
}

export const UserPage = () => {

    return (
        <Show title={<PostTitle/>} actions={
            <TopToolbar>
                <PrevNextButtons linkType="show"/>
            </TopToolbar>}>
            <SimpleShowLayout>
                <TextField source="id" label="Username" />
                <TextField source="pw_name" label="Name" />
                <ReferenceManyField label="Compute usage in Projects" target="user" reference="compute_latest">
                    <Datagrid bulkActionButtons={false}>
                        <TextField source="project"/>
                        <NumberField source="usage" />
                    </Datagrid>
                </ReferenceManyField>
            </SimpleShowLayout>
            
        </Show>
    )
};