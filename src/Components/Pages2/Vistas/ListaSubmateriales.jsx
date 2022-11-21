import { Button, Dialog, Paper, Box, Container, Grid, Tooltip, TableCell, makeStyles, Typography, TableContainer, Table, TableHead, TableRow, TableBody, IconButton, InputAdornment, TextField, CircularProgress } from '@material-ui/core'
import React from 'react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import RegisterSubMaterial from '../Registros/RegisterSubMaterial'
import InfoIcon from '@material-ui/icons/Info';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import ImageIcon from '@material-ui/icons/Image';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import sello from '../../../images/sello.png'
import PrintIcon from '@material-ui/icons/Print';
import { useHistory, useLocation } from 'react-router-dom'

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '1rem'
    },
    tableRow: {
        "&:hover": {
            backgroundColor: "#bbdefb"
        }
    }
}))
const ListaSubmateriales = (props) => {
    const classes = useStyles()
    // const { history } = props
    const location = useLocation()
    // console.log(location)
    const history=useHistory()
    // console.log(history)
    // var url = props.location.pathname
    var url = history.location.pathname
    url = url.split("/")
    // console.log(url)
    var array = []
    var dos;
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [subMaterial, setSubMaterial] = useState([])
    const [subMaterialTotal, setSubMaterialTotal] = useState([])
    const [unidadMedida, setUnidadMedida] = useState([])
    const [openImage, setOpenImage] = useState(false)
    const [progress, setProgress] = useState('none')
    const [exist, setExist] = useState('none')
    const [openImageDelete, setOpenImageDelete] = useState(false)
    const [changeData, setChangeData] = useState({
        _id: "",
        nameSubMaterial: '',
        nameMaterial: "",
        codMaterial: "",
        unidadMedida: '',
        image: '',
        codSubMaterial: "",
    })

    useEffect(() => {
        // getSubMaterial()
        // getSubMaterialTotal()
        // getUnidadMedida()
        getDataSubMaterial()
    }, [])

    //---------------GET SUB-MATERIALES------------------------
    const getSubMaterial = async () => {
        setProgress('flex')
        try {
            const result = await ipcRenderer.invoke('get-submaterial', url[2])
                .then(resp => {
                    if (JSON.parse(resp.length) === 0) {
                        setExist('flex')
                    }
                    setProgress('none')
                    // setSubMaterial(JSON.parse(result))
                    setSubMaterial(JSON.parse(resp))
                })
            const result2 = await ipcRenderer.invoke("get-subMaterial-total", url[2])
            setSubMaterialTotal(JSON.parse(result2))
        } catch (error) {
            console.log(error)
        }
    }
    //------------------GET SUB-MATERIALES TOTALES PRUEBA 2-----------------------------
    const [subMaterialData,setSubMaterialData]=useState([])
    const getDataSubMaterial=async()=>{
        setProgress('flex')
        await ipcRenderer.invoke('get-data-sub-material',url[2])
        .then(resp=>{
            if (JSON.parse(resp.length) === 0) {
                setExist('flex')
            }
            setProgress('none')
            // console.log(JSON.parse(resp))
            setSubMaterialData(JSON.parse(resp))
        })
        .catch(err=>console.log(err))
    }
    //-------------------EDIT SUB MATERIAL -----------------------
    const openModalImage = (e) => {
        setChangeData(e)
        setPreview(e.image)
        setOpenImage(true)
    }
    const closeModalImage = () => {
        setOpenImage(false)
    }
    const editSubMaterial = async (e) => {
        e.preventDefault()
        var data = {
            _id: changeData._id,
            nameSubMaterial: changeData.nameSubMaterial,
            nameMaterial: changeData.nameMaterial,
            codMaterial: changeData.codMaterial,
            unidadMedida: changeData.unidadMedida,
            codSubMaterial: changeData.codSubMaterial,
            image: preview
        }
        const result = await ipcRenderer.invoke('edit-submaterial', data)
        closeModalImage()
        getSubMaterial()
        getSubMaterialTotal()
        console.log(JSON.parse(result))

        // console.log(data)

    }
    //-------------------GET SUB - MATERIALES TOTAL -----------------------
    const getSubMaterialTotal = async () => {
        try {
            // const result = await ipcRenderer.invoke("get-subMaterial-total", url[2])
            const result = await ipcRenderer.invoke("get-subMaterial-total", location.data.code)
            setSubMaterialTotal(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }

    }
    //-------------------DELETE SUB - MATERIAL-----------------------
    const openModalImageDelete = (e) => {
        setChangeData(e)
        setOpenImageDelete(true)
    }
    const closeModalImageDelete = () => {
        setOpenImageDelete(false)
    }
    const deleteSubMaterial = async (e) => {
        e.preventDefault()
        // const id=changeData_id
        const result = await ipcRenderer.invoke('delete-submaterial', changeData)
        closeModalImageDelete()
        getSubMaterial()
        getSubMaterialTotal()
        console.log(JSON.parse(result))

    }

    //---------------------IR A TARJETA DE EXISTENCIA------------------------------
    const irTarjeta = (e) => {
        // console.log(e)
        const codMaterial = e.codMaterial
        const codSubMaterial = e.codSubMaterial
        const nameMaterial = e.nameMaterial
        const nameSubMaterial = e.nameSubMaterial
        const saldoInicial = e.saldoInicial
        const unidadMedida = e.unidadMedida
        history.push({
            pathname: '/tarjetaExistencia/' + codMaterial + '/' + nameMaterial + '/' + codSubMaterial + '/' + nameSubMaterial + "/" + saldoInicial + "/" + unidadMedida,
            data: {
                codMaterial: codMaterial,
                nameMaterial: nameMaterial,
                codSubMaterial: codSubMaterial,
                nameSubMaterial: nameSubMaterial,
                saldoInicial: saldoInicial,
                unidadMedida: unidadMedida
            }
        })

    }
    const irkardex = (e) => {
        // console.log(e)
        const codMaterial = e.codMaterial
        const codSubMaterial = e.codSubMaterial
        const nameMaterial = e.nameMaterial
        const nameSubMaterial = e.nameSubMaterial
        const saldoInicial = e.saldoInicial
        const unidadMedida = e.unidadMedida
        history.push({
            pathname: '/kardexValorado/' + codMaterial + '/' + nameMaterial + '/' + codSubMaterial + '/' + nameSubMaterial + "/" + saldoInicial + "/" + unidadMedida+'/',
            data: {
                codMaterial: codMaterial,
                nameMaterial: nameMaterial,
                codSubMaterial: codSubMaterial,
                nameSubMaterial: nameSubMaterial,
                saldoInicial: saldoInicial,
                unidadMedida: unidadMedida
            }
        })

    }
    

    for (var i = 0; i < subMaterial.length; i++) {
        dos = { ...subMaterialTotal[i], ...subMaterial[i] }
        // console.log(dos)
        array.push(dos)
    }

    //---------------------------BUSCADOR---------------------------------------------
    const [buscador, setBuscador] = useState("")

    const buscarSubMaterial = (buscador) => {
        return function (x) {
            return x.codSubMaterial.includes(buscador) ||
                x.nameSubMaterial.toLowerCase().includes(buscador) ||
                x.unidadMedida.toLowerCase().includes(buscador) ||
                x.nameSubMaterial.includes(buscador) ||
                x.unidadMedida.includes(buscador) ||
                !buscador

        }
    }
    //--------------------------------------PDF GENERATE---------------------------------
    const pdfGenerate = () => {
        // const doc = new jsPDF()
        const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [14, 11] })

        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()

        document.getElementById('desaparecer1').style.display = 'none'
        document.getElementById('desaparecer2').style.display = 'none'
        doc.setFontSize(15)
        doc.setFont('Courier', 'Bold');
        doc.addImage(`${sello}`, 0.5, 0.3, 1.5, 0.7)
        doc.text(`${url[3]}`, pageWidth / 2, 1, 'center')
        // doc.autoTable({ html: "#id-table", styles: { fontSize: 9 }, margin: { top: 35 } })
        doc.autoTable({
            headStyles: {
                fillColor: [50, 50, 50]
            },
            bodyStyles: {
                cellPadding: 0.01
            },
            head: [[
                { content: 'N°', styles: { halign: 'center' } },
                { content: 'Cod', styles: { halign: 'center' } },
                { content: 'Nombre', styles: { halign: 'center' } },
                { content: 'Unidad', styles: { halign: 'center' } },
                { content: 'Saldo Inicial', styles: { halign: 'center' } },
                { content: 'Saldo Actual', styles: { halign: 'center' } },
                { content: 'Precio Total', styles: { halign: 'center' } },
                { content: 'Precio Unitario', styles: { halign: 'center' } },
            ]],
            body: subMaterialData.map((d, index) => ([
                { content: index + 1 },
                { content: d.codSubMaterial, styles: { halign: 'center' } },
                { content: d.nameSubMaterial },
                { content: d.unidadMedida, styles: { halign: 'center' } },
                { content: d.saldoInicial, styles: { halign: 'right' } },
                { content: d.saldoActual, styles: { halign: 'right' } },
                { content: d.precioTotal, styles: { halign: 'right' } },
                { content: d.precioUnitario, styles: { halign: 'right' } },
            ])),
            styles: { fontSize: 8, font: 'courier', fontStyle: 'bold' },
            startY: 1.3,
        })
        var pages = doc.internal.getNumberOfPages()
        for (var i = 1; i <= pages; i++) {
            var horizontalPos = pageWidth / 2
            var verticalPos = pageHeight - 0.2
            doc.setFontSize(8)
            doc.setPage(i)
            doc.text(`${i} de ${pages}`, horizontalPos, verticalPos, { align: 'center' })
        }
        document.getElementById('desaparecer1').style.display = 'revert'
        document.getElementById('desaparecer2').style.display = 'revert'
        window.open(doc.output('bloburi'))
    }
    //-----------------------HANDLE CHANGE-----------------------
    const handleChange = (e) => {
        // console.log(e)
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            // document.getElementById('img').style.display = 'none'
            // document.getElementById('img2').style.display = 'block'
            if (file.type.includes('image')) {
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = () => {
                    setPreview(reader.result)
                    setImage(e.target.files[0])
                    // console.log(preview)
                    // console.log(image)
                }
            }
            else { console.log('no funciona') }
        }
        setChangeData({
            ...changeData,
            [e.target.name]: e.target.value
        })
    }
    //-------------------GET UNIDAD DE MEDIDA------------------------
    const getUnidadMedida = async () => {
        const result = await ipcRenderer.invoke('get-unidadMedida')
        setUnidadMedida(JSON.parse(result))

    }
    // const nombre=history.location.data.nameMaterial
    //----------------------------------------------
    return (
        <>
            <Typography style={{ paddingTop: '2rem', marginBottom: '1rem', color: 'white' }} align='center' variant='h5'>{url[3]}</Typography>
            <Container maxWidth='lg'>
                <Grid container direction='row' justifyContent='space-between' alignItems='center' style={{ marginBottom: '0.5rem' }}>
                    <RegisterSubMaterial dos={url} uno={getSubMaterial} />
                    <div>
                        {subMaterialData &&
                            <TextField
                                style={{ background: 'white', borderRadius: 5, marginRight: '1rem' }}
                                variant='outlined'
                                size='small'
                                // fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <>
                                            <Typography variant='subtitle1' style={{ marginRight: '0.5rem' }}>Buscar</Typography>
                                            <InputAdornment position='start'>
                                                <SearchIcon />
                                            </InputAdornment>

                                        </>
                                    )
                                }}
                                onChange={e => setBuscador(e.target.value)}
                            />
                        }
                        <IconButton
                            component="span"
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                                marginRight: '0.5rem',
                            }}
                            onClick={pdfGenerate}>
                            <Tooltip title='imprimir'>
                                <PrintIcon />
                            </Tooltip>
                        </IconButton>
                        <IconButton
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #0277bd 30%, #82b1ff 90%)',
                                marginRight: '0.5rem',
                            }}
                            component={Link}
                            to="/listaProduct">
                            <Tooltip title='atras'>
                                <ArrowBackIcon />
                            </Tooltip>
                        </IconButton>
                    </div>

                </Grid>
                <Paper component={Box} p={0.3}>
                    <TableContainer style={{ maxHeight: 450 }}>
                        <Table id='id-table' style={{ minWidth: 1000 }} stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>{url[2]}</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Nombre</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Unidad</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Saldo Inicial</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Saldo Actual</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Precio Total</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Precio Unitario</TableCell>
                                    <TableCell id='desaparecer1' style={{ color: 'white', backgroundColor: "black" }}>Tarjeta/Kardex</TableCell>
                                    <TableCell id='desaparecer2' style={{ color: 'white', backgroundColor: "black" }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subMaterialData.length > 0 ? (
                                    subMaterialData.filter(buscarSubMaterial(buscador)).map(s => (
                                        <TableRow key={s._id} className={classes.tableRow}>
                                            <TableCell>{s.codSubMaterial}</TableCell>
                                            <TableCell>{s.nameSubMaterial}</TableCell>
                                            <TableCell>{s.unidadMedida}</TableCell>
                                            <TableCell align='right'>{s.saldoInicial}</TableCell>
                                            <TableCell align='right'>{s.saldoActual}</TableCell>
                                            <TableCell align='right'>{s.precioTotal}</TableCell>
                                            <TableCell align='right'>{s.precioUnitario}</TableCell>
                                            <TableCell style={{ padding: 0, margin: 0 }}>
                                                <Grid container justifyContent='space-evenly'>
                                                    <Tooltip title='edit'>
                                                        <IconButton size='small' style={{ color: 'green' }} onClick={() => openModalImage(s)}>
                                                            <ImageIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='tarjeta'>
                                                        <IconButton size='small' onClick={() => irTarjeta(s)}>
                                                            <FilterNoneIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='kardex' >
                                                        <IconButton size='small' onClick={() => irkardex(s)}>
                                                            <CreditCardIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            </TableCell>
                                            <TableCell style={{ padding: 0, margin: 0 }}>
                                                <Grid container justifyContent='space-evenly'>
                                                    <Tooltip title='delete'>
                                                        <IconButton size='small' style={{ color: 'red' }} onClick={() => openModalImageDelete(s)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell align='center' colSpan='8' style={{ display: progress }}>
                                            <CircularProgress />
                                            {/* <LinearProgress /> */}
                                        </TableCell>
                                        <TableCell style={{ display: exist }} colSpan='8' align='center'>no existen datos</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
            {/* ------------------------------------------------------------------*/}
            <Dialog
                open={openImage}
                onClose={closeModalImage}
                maxWidth='md'
            >
                <Paper component={Box} p={2} /*style={{ background: '#bdbdbd', width: '300px', height: '300px' }}*/>
                    {/* <Typography className={classes.spacingBot} variant='subtitle1' align='center'>EDITAR SUB-MATERIAL</Typography> */}
                    <form onSubmit={editSubMaterial}>
                        {/* <Grid container spacing={3}>
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
                                    defaultValue={changeData.nameSubMaterial}
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
                                        <img id='img' src={changeData.image} style={{ width: '100%', height: '100%' }} alt='#' />
                                        <img id='img' src={preview} style={{ width: '100%', height: '100%' }} alt='#' />
                                        <img id='img2' src={preview} style={{ width: '100%', height: '100%', display: 'none' }} alt='#' />
                                    </Paper>
                                    <input
                                        name='image'
                                        type='file'
                                        accept='image/*'
                                        id='file-image'
                                        style={{ display: 'none' }}
                                        // value={changeData.image}
                                        onChange={handleChange}
                                    // required

                                    />
                                    <label htmlFor='file-image'>
                                        <Button size='small' style={{ marginTop: '1rem' }} variant='contained' color='primary' component='span'>cargar</Button>
                                    </label>
                                </div>
                            </Grid>
                        </Grid> */}
                        <div align='center' className={classes.spacingBot}>
                            <Paper component={Box} p={1} style={{ background: '#bdbdbd', width: '250px', height: '250px' }}>
                                {/* <img id='img' src={changeData.image} style={{ width: '100%', height: '100%' }} alt='#' /> */}
                                <img id='img' src={preview} style={{ width: '100%', height: '100%' }} alt='#' />
                                {/* <img id='img2' src={preview} style={{ width: '100%', height: '100%', display: 'none' }} alt='#' /> */}
                            </Paper>
                            <input
                                name='image'
                                type='file'
                                accept='image/*'
                                id='file-image'
                                style={{ display: 'none' }}
                                // value={changeData.image}
                                onChange={handleChange}
                            // required

                            />
                            <label htmlFor='file-image'>
                                <Button style={{ marginTop: '1rem', fontSize: 'xx-small' }} variant='contained' color='primary' component='span'>cargar</Button>
                            </label>
                        </div>
                        <Grid container justifyContent='space-evenly'>
                            <Button style={{ fontSize: 'xx-small' }} variant='contained' color='primary' type='submit' >aceptar</Button>
                            <Button style={{ fontSize: 'xx-small' }} variant='contained' color='secondary' onClick={closeModalImage} >cancelar</Button>
                        </Grid>
                    </form>
                </Paper>
            </Dialog>
            <Dialog
                open={openImageDelete}
                onClose={closeModalImageDelete}
                maxWidth='xs'
            >
                <Paper component={Box} p={2}>
                    <Typography variant='subtitle1' align='center' className={classes.spacingBot} >¿ Estas seguro de Elinimar " {changeData.nameSubMaterial} " y toda su informacion? </Typography>
                    <Grid container justifyContent='space-evenly'>
                        <Button style={{ fontSize: "xx-small" }} variant='contained' color='primary' onClick={deleteSubMaterial} >aceptar</Button>
                        <Button style={{ fontSize: "xx-small" }} variant='contained' color='secondary' onClick={closeModalImageDelete} >cancelar</Button>
                    </Grid>
                </Paper>
            </Dialog>
        </>
    )
}

export default ListaSubmateriales
