import { Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, styled } from '@material-ui/core'
import React from 'react'
import { makeStyles } from '@material-ui/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Home from '../Pages/Home'
import ListaProduct from '../Pages2/Vistas/ListaProduct';
import ListaSubmateriales from '../Pages2/Vistas/ListaSubmateriales';
import IngresoMateriales from '../Pages2/Registros/IngresoMateriales';
import SalidaMateriales from '../Pages2/Registros/SalidaMateriales';
import ListaAlmacen from '../Pages2/Almacen/ListaAlmacen';
import HojaCostos from '../Pages2/Costos/HojaCostos';
import TarjetaExistencia from '../Pages2/Vistas/TarjetaExistencia';
import KardexValorado from '../Pages2/Vistas/KardexValorado';
import ListaIngresoAlmacen from '../Pages2/Almacen/ListaIngresoAlmacen';
import ListaSalidaAlmacen from '../Pages2/Almacen/ListaSalidaAlmacen';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        width: 240,
        background: '#141e30'
    },
}))
export const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(4.5),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 240,
        }),
    }),
);


const NewDrawer = (props) => {
    const classes = useStyles()
    return (
        <div>
            <Drawer
                open={props.openDrawer}
                onClose={props.closeDrawer}
                anchor='left'
                variant='persistent'
                classes={{ paper: classes.drawerPaper }}
                style={{ flexShrink: 0 }}
            >
                <div align='right'>
                    <IconButton onClick={props.closeDrawer} >
                        <ChevronLeftIcon style={{ color: 'white' }} />
                    </IconButton>
                </div>
                <Divider />
                <List component='nav'>
                    <ListItem button component={Link} to='/' style={{ color: 'yellowgreen' }}>
                        <ListItemIcon >
                            <ArrowRightAltIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText>Inicio</ListItemText>
                    </ListItem>
                    <ListItem button component={Link} to='/listaProduct' style={{ color: 'yellowgreen' }}>
                        <ListItemIcon>
                            <ArrowRightAltIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText>Lista de Productos</ListItemText>
                    </ListItem>
                    <ListItem button component={Link} to='/ingresoMateriales' style={{ color: 'yellowgreen' }}>
                        <ListItemIcon>
                            <ArrowRightAltIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText>Ingreso de Materiales</ListItemText>
                    </ListItem>
                    {/* <ListItem button component={Link} to='/salidaMateriales' style={{ color: 'yellowgreen' }}>
                        <ListItemIcon>
                            <ArrowRightAltIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText>Salida de Materiales</ListItemText>
                    </ListItem> */}
                    <ListItem button component={Link} to='/listaAlmacen' style={{ color: 'yellowgreen' }}>
                        <ListItemIcon>
                            <ArrowRightAltIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText>Almacén</ListItemText>
                    </ListItem>
                    <ListItem button component={Link} to='/hojaCostos' style={{ color: 'yellowgreen' }}>
                        <ListItemIcon>
                            <ArrowRightAltIcon style={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText>Hoja de Costos</ListItemText>
                    </ListItem>
                </List>
            </Drawer>
            <Main open={props.openDrawer}>
                <Route path='/' exact component={Home}/>
                <Route path='/listaProduct' exact component={ListaProduct} />
                <Route path='/listaSubmateriales/:id'  component={ListaSubmateriales} />
                <Route path='/ingresoMateriales' exact component={IngresoMateriales} />
                {/* <Route path='/salidaMateriales' exact component={SalidaMateriales} /> */}
                <Route path='/tarjetaExistencia/:id' component={TarjetaExistencia} />
                <Route path='/kardexValorado/:id' component={KardexValorado} />
                <Route path='/listaAlmacen' exact component={ListaAlmacen} />
                <Route path='/listaIngresoAlmacen'  component={ListaIngresoAlmacen} />
                <Route path='/listaSalidaAlmacen'  component={ListaSalidaAlmacen} />
                <Route path='/hojaCostos' exact component={HojaCostos} />
            </Main>
        </div>
    )
}

export default NewDrawer