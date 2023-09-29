import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { dataProvider } from "./dataProvider";
import { UserList } from "./components/users";
import { UserPage } from "./components/userpage";

export const App = () => <Admin dataProvider={dataProvider}>
  <Resource name="users" list={UserList} show={UserPage}/>
</Admin>;
