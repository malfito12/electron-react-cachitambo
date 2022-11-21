import {  Box, Button, Dialog, Grid, makeStyles, Paper, TextField, Typography } from '@material-ui/core'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '1rem'
    }
}))

const UnidadMedida = () => {
    const classes = useStyles()
    const [openRegister, setOpenRegister] = useState(false)
    const [unidadData, setUnidadData] = useState([])
    const [changeData, setChangeData] = useState({
        nameUnidadMedida: '',
        simbolo: ''
    })
    
    useEffect(()=>{
        // getUnidadMedida()
    },[])

    //-------------POST UNIDAD MEDIDA-------------------------
    const openModalRegister = () => {
        setOpenRegister(true)
    }
    const closeModalRegister = () => {
        setOpenRegister(false)
    }
    const postUnidadMedida = async (e) => {
        e.preventDefault()
        const result = await ipcRenderer.invoke('post-unidadMedida', changeData)
        console.log(result)
        closeModalRegister()
        window.location.reload()
    }
    //------------------------------------------------------
    const getUnidadMedida=async()=>{
        await ipcRenderer.invoke('get-unidad-medida')
        .then(resp=>{
            alert(JSON.parse(resp))
            setUnidadData(JSON.parse(resp))
        })
        .catch(err=>console.log(err))
    }
    //------------------------------------------------------
    const handleChange=(e)=>{
        setChangeData({
            ...changeData,
            [e.target.name]:e.target.value
        })
    }
    return (
        <>
            {/* <AppBar position='fixed' style={{background:'#424242'}}>
            <Toolbar>
                <div style={{flexGrow:1}}></div>
                <Button size='small' variant='contained' color='primary' onClick={openModalRegister}>U. Medida</Button>
            </Toolbar>
        </AppBar> */}

            <Button size='small' style={{color:'white'}} onClick={openModalRegister}>Unidad Medida</Button>
            <Dialog
                open={openRegister}
                onClose={closeModalRegister}
                maxWidth='xs'
            >
                <Paper component={Box} p={2}>
                    <Typography className={classes.spacingBot} variant='subtitle1' align='center'>Registrar Unidad de Medida</Typography>
                    <form onSubmit={postUnidadMedida}>
                        <TextField
                            name='nameUnidadMedida'
                            label='Nombre de unidad de Medida'
                            variant='outlined'
                            fullWidth
                            size='small'
                            className={classes.spacingBot}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            name='simbolo'
                            label='Simbolo'
                            variant='outlined'
                            fullWidth
                            size='small'
                            className={classes.spacingBot}
                            onChange={handleChange}
                            required
                        />
                        <Grid container justifyContent='space-evenly'>
                            <Button size='small' variant='contained' color='primary' type='submit'>aceptar</Button>
                            <Button size='small' variant='contained' color='secondary' onClick={closeModalRegister}>cancelar</Button>
                        </Grid>
                    </form>
                </Paper>
            </Dialog>
        </>
    )
}

export default UnidadMedida
