import { Icon } from '@iconify/react';
// material
import { Stack, Button} from '@mui/material';
import { GitlabLoginButton} from './social_buttons/GitlabButtons';
import { GithubLoginButton} from 'react-social-login-buttons';
import { BitbucketLoginButton} from './social_buttons/BitBucketButtons'

// ----------------------------------------------------------------------

export default function AuthSocial() {
  return (
    <>
      <Stack direction="row" spacing={2}>
        <GithubLoginButton onClick={() => alert('Hello')} />

        <GitlabLoginButton onClick={() => alert('Hello')} />

        <BitbucketLoginButton onClick={() => alert('Hello')} />
      </Stack>

    </>
  );
}
