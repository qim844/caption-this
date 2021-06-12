import { selector } from 'recoil';
import { Auth } from 'aws-amplify'

const currentUserNameQuery = selector({
  key: 'CurrentUserName',
  get: async () => {
    const response = await Auth.currentAuthenticatedUser();
    return response.username;
  },
});

export default currentUserNameQuery;

