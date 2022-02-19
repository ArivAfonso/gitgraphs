import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import ConnectButton from '../intregrations/CustomButton'

export default function IntCard(props) {
  return (
    <Card sx={{ maxWidth: 300 }}>
      <CardMedia
        component="img"
        height="140"
        image={props.img-url}
        alt= {props.alt}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" align="center">
          {props.description}
        </Typography>
      </CardContent>
      <CardActions>
        <ConnectButton></ConnectButton>
      </CardActions>
    </Card>
  );
}