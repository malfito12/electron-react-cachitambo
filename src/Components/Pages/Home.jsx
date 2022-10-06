import { Button, Grid, makeStyles, Typography } from '@material-ui/core'
// import { ipcRenderer } from 'electron/renderer'
import React from 'react'
import { Link } from 'react-router-dom'

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3)
    },
    root1: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        // height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        width: 200,
        height: 150
    },
    root2: {
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        // height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        width: 200,
        height: 150
    },
    root3: {
        background: 'linear-gradient(45deg, #00897b 30%, #4db6ac 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        // height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        width: 200,
        height: 150
    },
    label: {
        textTransform: 'capitalize',
    },
}))

const cambiarFechas=async()=>{
    await ipcRenderer.invoke(`cambiar-fechas`)
    .then(resp=>{
        alert(JSON.parse(resp))
        console.log(JSON.parse(resp))
    })
    .catch(err=>console.log(err))
}
const registrarMovimientos=async()=>{
    await ipcRenderer.invoke('register-movimiento')
    .then(resp=>{
        alert(JSON.parse(resp))
    })
    .catch(err=>console.log(err))
}
const postIdAlmacen=async()=>{
    await ipcRenderer.invoke('id-almacen')
    .then(resp=>{
        alert(JSON.parse(resp))
    })
    .catch(err=>console.log(err))
}
const Home = () => {
    const classes = useStyles()
    return (
        <>
            {/* <div style={{ paddingLeft: 240, marginBottom: '2rem' }}> */}
            <Typography style={{ paddingTop: '5rem', marginBottom: '4rem' }} variant='h4' align='center'>Pagina Principal</Typography>
            {/* <Button variant='contained' color='primary' component={Link} to='/register'>Register</Button> */}
            <div align='center'>
                <Grid container item xs={12} sm={12} justifyContent='space-evenly'>
                    {/* <Button component={Link} to='/register' style={{ marginBottom: '4rem' }} classes={{ root: classes.root1, label: classes.label }}>Registro de Materiales</Button> */}
                    <Button component={Link} to='/listaProduct' style={{ marginBottom: '4rem' }} classes={{ root: classes.root2, label: classes.label }}>Lista de Materiales</Button>
                    <Button component={Link} to='/listaAlmacen' style={{ marginBottom: '4rem' }} classes={{ root: classes.root3, label: classes.label }}>Almacén</Button>
                </Grid>
            </div>
            <div align='center'>
                <Grid item xs={12} sm={12} >
                    <Button component={Link} to='/ingresoMateriales' style={{ marginBottom: '1rem', marginRight: '4rem' }} classes={{ root: classes.root1, label: classes.label }}>Ingresos</Button>
                    <Button component={Link} to='/salidaMateriales' style={{ marginBottom: '1rem' }} classes={{ root: classes.root2, label: classes.label }}>Salidas</Button>
                </Grid>
            </div>

            <button onClick={cambiarFechas}>cambiar fechas</button>
            <button onClick={postIdAlmacen}>id-Almacen</button>
            <button onClick={registrarMovimientos}>registrar movimientos</button>
        </>
    )
}

export default Home
