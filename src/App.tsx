import {
  Admin,
  Resource,
} from "react-admin";
import { dataProvider } from "./dataProvider";
import { UserList } from "./components/users";
import { UserPage } from "./components/userpage";
import { GroupList } from "./components/groups";
import { GroupPage } from "./components/grouppage";
import { QueryClient } from 'react-query';

export const App = () => 
  {
  const queryClient = new QueryClient({
      defaultOptions: {
          queries: {
              staleTime: 5 * 60 * 1000, // This data is updated every 6 hours, the stale time can be very long
          },
      },
  });
    return (
      <Admin dataProvider={dataProvider} queryClient={queryClient}>
        <Resource name="users" list={UserList} show={UserPage}/>
        <Resource name="groups" list={GroupList} show={GroupPage}/>
      </Admin>
    )
  }
