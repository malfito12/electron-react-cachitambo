import { Button, MenuItem, Box, Dialog, Paper, Typography, makeStyles, TextField, Grid } from '@material-ui/core'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import BookmarkIcon from '@material-ui/icons/Bookmark';


const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '1rem'
    }
}))
const RegisterSubMaterial = (props) => {
    // console.log(props.dos)
    const classes = useStyles()
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [openRegister, setOpenRegister] = useState(false)
    const [unidadMedida, setUnidadMedida] = useState([])
    const [changeData, setChangeData] = useState({
        nameSubMaterial: '',
        nameMaterial: props.dos[3],
        codMaterial: props.dos[2],
        unidadMedida: '',
        image: ''
    })
    // console.log(props.url)

    useEffect(() => {
        getUnidadMedida()
    }, [])

    //------------POST SUB-MATERIAL-----------------
    const openModalRegister = () => {
        setOpenRegister(true)
    }
    const closeModalRegister = () => {
        setOpenRegister(false)
    }
    const postSubMaterial = async (e) => {
        e.preventDefault()
        var data = {
            nameSubMaterial: changeData.nameSubMaterial,
            nameMaterial: changeData.nameMaterial,
            codMaterial: changeData.codMaterial,
            unidadMedida: changeData.unidadMedida,
            image: preview
        }
        const result = await ipcRenderer.invoke('post-subMaterial', data)
        console.log(JSON.parse(result))
        closeModalRegister()
        props.uno()
        // setChangeData('')
        // console.log(data)

        // console.log(formData)
    }
    //----------------------------------------------
    //----------------------------------------------
    //----------------------------------------------
    //-------------------GET UNIDAD DE MEDIDA------------------------
    const getUnidadMedida = async () => {
        try {
            const result = await ipcRenderer.invoke('get-unidadMedida')
            setUnidadMedida(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }

    }
    //----------------------------------------------
    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            if (file.type.includes('image')) {
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = () => {
                    setPreview(reader.result)
                    setImage(e.target.files[0])
                    // console.log(reader.result)
                    // var base64=reader.result
                    // console.log(base64)
                    // return base64
                    // setChangeData({image:reader.result})
                    // console.log(image)
                }
            }
            else { console.log('no funciona') }
        }
        // console.log(base64)
        setChangeData({
            ...changeData,
            [e.target.name]: e.target.value
        })
    }

    // console.log(preview)
    // console.log(changeData)
    return (
        <>
            <Button style={{ background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)', color: 'white' }} endIcon={<BookmarkIcon />} variant='contained'  onClick={openModalRegister}>registrar sub-material</Button>
            <Dialog
                open={openRegister}
                onClose={closeModalRegister}
                maxWidth='md'
                style={{ paddingLeft: 240 }}
            >
                <Paper component={Box} p={2}>
                    <Typography className={classes.spacingBot} variant='subtitle1' align='center'>Registrar Sub - Material</Typography>
                    <form onSubmit={postSubMaterial}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    disabled
                                    name='nameMaterial'
                                    label='Tipo de Material'
                                    variant='outlined'
                                    fullWidth
                                    size='small'
                                    className={classes.spacingBot}
                                    defaultValue={changeData.nameMaterial}
                                    required
                                />
                                <TextField
                                    name='nameSubMaterial'
                                    label='Nombre del Material'
                                    variant='outlined'
                                    className={classes.spacingBot}
                                    fullWidth
                                    size='small'
                                    onChange={handleChange}
                                    required
                                />
                                <TextField
                                    name='unidadMedida'
                                    label='Unidad de Medida'
                                    variant='outlined'
                                    className={classes.spacingBot}
                                    select
                                    fullWidth
                                    size='small'
                                    onChange={handleChange}
                                    value={changeData.unidadMedida}
                                    required
                                >
                                    {unidadMedida.map((m, index) => (
                                        <MenuItem key={index} value={m.nameUnidadMedida} >{m.nameUnidadMedida}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div align='center' className={classes.spacingBot}>
                                    <Paper component={Box} p={1} style={{ background: '#bdbdbd', width: '150px', height: '150px' }}>
                                        <img src={preview} style={{ width: '100%', height: '100%' }} alt='#' />
                                    </Paper>
                                    <input
                                        name='image'
                                        type='file'
                                        accept='image/*'
                                        id='file-image'
                                        style={{ display: 'none' }}
                                        onChange={handleChange}
                                    // required

                                    />
                                    <label htmlFor='file-image'>
                                        <Button size='small' style={{ marginTop: '1rem' }} variant='contained' color='primary' component='span'>cargar</Button>
                                    </label>
                                </div>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent='space-evenly'>
                            <Button size='small' variant='contained' color='primary' type='submit' >aceptar</Button>
                            <Button size='small' variant='contained' color='secondary' onClick={closeModalRegister} >cancelar</Button>
                        </Grid>
                    </form>
                </Paper>
            </Dialog>
        </>
    )
}

export default RegisterSubMaterial
