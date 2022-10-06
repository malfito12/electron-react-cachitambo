import { Container, TextField, Grid, makeStyles, Typography, Button, MenuItem, IconButton, Paper } from '@material-ui/core'
import React, { useEffect } from 'react'
import { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save';
import SearchIcon from '@material-ui/icons/Search';
import { ErrorRegisterSalidaMat, SuccessRegisterSalidaMat } from '../../Atoms/Alerts/Alerts';

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '1rem'
    },
    styleTablehead: {
        color: 'white',
        backgroundColor: "black",
        align: 'center'
    }
}))
const SalidaMateriales = () => {
    const classes = useStyles()
    const [material, setMaterial] = useState([])
    const [subMaterial, setSubMaterial] = useState([])
    const [subMaterialCantidad, setSubMaterialCantidad] = useState([])
    const [unidadMedida, setUnidadMedida] = useState([])
    const [openAlertRegisterMatSuccess, setOpenAlertRegisterMatSuccess] = useState(false)
    const [openAlertRegisterMatError, setOpenAlertRegisterMatError] = useState(false)
    const [changeData, setChangeData] = useState({
        typeRegister: 'salida',
        nameMaterial: '',
        nameSubMaterial: '',
        cantidadF: '',
        precio: '',
        precioUnitario: '',
        procedenciaDestino: '',
        unidadMedida: '',
        registerDate: '',
        numVale: '',
        codMaterial: '',
        codSubMaterial: '',
    })

    useEffect(() => {
        getMaterial()
        getUnidadMedida()
    }, [])

    //--------------POST SALIDA MATERIALES--------------------------

    const postSalida = async (e) => {
        e.preventDefault()
        var aux1 = changeData.nameMaterial
        var aux2 = changeData.nameSubMaterial
        aux1 = aux1.split("/")
        aux2 = aux2.split("/")
        var data = {
            typeRegister: 'salida',
            codMaterial: aux1[0],
            nameMaterial: aux1[1],
            codSubMaterial: aux2[0],
            nameSubMaterial: aux2[1],
            cantidadS: changeData.cantidadF,
            precioS: changeData.precio,
            precioUnitario: changeData.precioUnitario,
            procedenciaDestino: changeData.procedenciaDestino,
            unidadMedida: changeData.unidadMedida,
            registerDate: changeData.registerDate,
            numeroIngreso: " ",
            numVale: changeData.numVale,
        }
        try {
            const result = await ipcRenderer.invoke("post-salidas", data)
            console.log(JSON.parse(result))
            openCloseAlertRegisterMatSuccess()
            setTimeout(() => setOpenAlertRegisterMatSuccess(false), 4000)
            document.getElementById('nameMaterial').value = ""
            document.getElementById('nameSubMaterial').value = ""
            document.getElementById('cantidadF').value = ""
            document.getElementById('precio').value = ""
            document.getElementById('precioUnitario').value = ""
            document.getElementById('procedenciaDestino').value = ""
            document.getElementById('numVale').value = ""
            document.getElementById('registerDate').value = ""
        } catch (error) {
            console.log(error)
            openCloseAlertRegisterMatError()
            setTimeout(() => setOpenAlertRegisterMatError(false), 4000)
        }
        // console.log(data)
    }
    //---------------------GET MATERIAL--------------------------------
    const getMaterial = async () => {
        try {
            const result = await ipcRenderer.invoke("get-material")
                .then(resp => {
                    setMaterial(JSON.parse(resp))
                })
            // setMaterial(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }
    }
    //-----------------------GET SUB-MATERIAL--------------------------------
    const getSubMaterial = async (e) => {
        try {
            const result = await ipcRenderer.invoke('get-submaterial', e)
                .then(resp => {
                    setSubMaterial(JSON.parse(resp))
                })
            // setSubMaterial(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }
    }
    const getCantidad = async (e) => {
        await ipcRenderer.invoke('get-cantidad-subMaterial', e)
            .then(resp => {
                setSubMaterialCantidad(JSON.parse(resp))
            })
            .catch(err => console.log(err))
    }
    var cantidad = 0
    if (subMaterialCantidad.length > 0) {
        for (var i = 0; i < subMaterialCantidad.length; i++) {
            if (subMaterialCantidad[i].typeRegister === 'entrada') {
                cantidad = cantidad + parseFloat(subMaterialCantidad[i].cantidadF)
            } else {
                cantidad = cantidad - parseFloat(subMaterialCantidad[i].cantidadS)
            }
        }
    }
    // console.log(subMaterial)
    //-----------------------GET MATERIAL ESPECIFICO------------------------
    const getSpecificMaterial = async () => {
        const data = changeData.codMaterial
        try {
            const result = await ipcRenderer.invoke('get-specific-material', data)
                .then(resp => {
                    const aux = JSON.parse(resp)
                    const lala = { target: { name: 'nameMaterial', value: aux[0].codMaterial + '/' + aux[0].nameMaterial } }
                    handleChange(lala)
                })
        } catch (error) {
            console.log(error)
        }
    }
    //----------------------GET SUB MATERIAL SPECIFICO--------------------------
    const getSpecificSubMaterial = async () => {
        const data = changeData.codSubMaterial
        try {
            const result = await ipcRenderer.invoke('get-specific-sub-material', data)
                .then(resp => {
                    // console.log(JSON.parse(resp))
                    const aux = JSON.parse(resp)
                    const lala = { target: { name: 'nameSubMaterial', value: aux[0].codSubMaterial + '/' + aux[0].nameSubMaterial } }
                    handleChange(lala)
                })
        } catch (error) {
            console.log(error)
        }
    }
    //--------------------------GET UNIDAD DE MEDIDA-----------------------------
    const getUnidadMedida = async (e) => {
        try {
            // const result = await ipcRenderer.invoke('get-unidadMedida')
            const result = await ipcRenderer.invoke('get-um', e)
            setUnidadMedida(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }
    }
    //-----------------------------------------------------------------
    const handleChange = (e) => {
        if (e.target.name === 'nameMaterial') {
            var aux = e.target.value
            aux = aux.split("/")
            getSubMaterial(aux[0])
        }
        if (e.target.name === 'nameSubMaterial') {
            var aux = e.target.value
            aux = aux.split("/")
            getUnidadMedida(aux[0])
            getCantidad(aux[0])
        }
        setChangeData({
            ...changeData,
            [e.target.name]: e.target.value
        })
    }
    //----------------------------ALERTS---------------------------------
    const openCloseAlertRegisterMatSuccess = () => {
        setOpenAlertRegisterMatSuccess(!openAlertRegisterMatSuccess)
    }
    const openCloseAlertRegisterMatError = () => {
        setOpenAlertRegisterMatError(!openAlertRegisterMatError)
    }
    // console.log(changeData)
    return (
        <>
            <Typography style={{ paddingTop: '4rem', marginBottom: '2rem', color: 'white' }} align='center' variant='h5'>SALIDA DE MATERIALES</Typography>
            <Container maxWidth='md'>
                <div style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                    <SuccessRegisterSalidaMat open={openAlertRegisterMatSuccess} setOpen={openCloseAlertRegisterMatSuccess} />
                    <ErrorRegisterSalidaMat open={openAlertRegisterMatError} setOpen={openCloseAlertRegisterMatError} />
                </div>
                <form onSubmit={postSalida}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id='numVale'
                                name='numVale'
                                label='N° de Pedido de Vale'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                value={changeData.numVale}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                name='codMaterial'
                                label='Codigo de Material'
                                variant='outlined'
                                fullWidth
                                size='small'
                                // value={changeData.codMaterial}
                                className={classes.spacingBot}
                                style={{ background: 'white', borderRadius: 5 }}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size='small' onClick={getSpecificMaterial} component='span' style={{ color: 'white', background: '#2979ff' }}>
                                            <SearchIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <TextField
                                id='nameMaterial'
                                name='nameMaterial'
                                label='Tipo de Material'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                select
                                value={changeData.nameMaterial}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            >
                                {material && material.map((e, index) => (
                                    <MenuItem key={index} value={`${e.codMaterial}/${e.nameMaterial}`}>{e.nameMaterial}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                name='codSubMaterial'
                                label='Codigo Sub Material'
                                variant='outlined'
                                fullWidth
                                size='small'
                                className={classes.spacingBot}
                                style={{ background: 'white', borderRadius: 5 }}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size='small' onClick={getSpecificSubMaterial} component='span' style={{ color: 'white', background: '#2979ff' }}>
                                            <SearchIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <TextField
                                id='nameSubMaterial'
                                name='nameSubMaterial'
                                label='Tipo de Sub - Material'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                select
                                onChange={handleChange}
                                value={changeData.nameSubMaterial}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            >
                                {subMaterial && subMaterial.map((s, index) => (
                                    <MenuItem key={index} value={`${s.codSubMaterial}/${s.nameSubMaterial}`}>{s.nameSubMaterial}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                id='cantidadF'
                                name='cantidadF'
                                label='Cantidad'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                type='number'
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id='precio'
                                name='precio'
                                label='Precio o Valor $us'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                type='number'
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                id='precioUnitario'
                                name='precioUnitario'
                                label='Precio Unitario'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                type='number'
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                id='procedenciaDestino'
                                name='procedenciaDestino'
                                label='Procedencia o Destino'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                id='unidadMedida'
                                name='unidadMedida'
                                label='Unidad de Medida'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                // onChange={handleChange}
                                // select
                                // value={changeData.unidadMedida}
                                value={unidadMedida.length > 0 ? unidadMedida[0].unidadMedida : ''}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            >
                                {/* {unidadMedida && unidadMedida.map((u, index) => (
                                    <MenuItem key={index} value={u.nameUnidadMedida}>{u.nameUnidadMedida}</MenuItem>
                                ))} */}
                            </TextField>
                            <TextField
                                id='registerDate'
                                name='registerDate'
                                label='Fecha de Salida'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                type='date'
                                InputLabelProps={{ shrink: true }}
                                size='small'
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <Paper style={{ background: 'white', borderRadius: 5, padding: 7 }}>
                                <Typography>Cantidad Actual: {cantidad}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent='space-evenly' style={{ marginTop: '2rem' }}>
                        <Button
                            endIcon={<SaveIcon />}
                            variant='contained'
                            type='submit'
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)'
                            }}
                        >registrar salida</Button>
                    </Grid>
                </form>
            </Container>
        </>
    )
}

export default SalidaMateriales
