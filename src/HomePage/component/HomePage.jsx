import { React } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableHighlight } from "react-native";
import StyleHome from '../../resources/css/StyleHome';
import BootstrapStyleSheet from 'react-native-bootstrap-styles';
import { HomePageController } from '../controller/HomePageController';
import logoCup from '../../resources/img/Logo-cupon.png';

const bootstrapStyleSheet = new BootstrapStyleSheet();
const { s, c } = bootstrapStyleSheet;

const HomePage = () => {
    const constructor = (props) => {
        this.homePageController = new HomePageController();
        this.state = {
            showModal: false,
            setShowModal: false,
            index: 0,
            setIndex: 0,
            reload: false,
            categories: [
                {
                    id: 0,
                    description: ''
                }
            ],
            categoriesPaged: {
                page: 0,
                total: 0
            },
            count: [0, 0, 0, 0, 0, 0, 0, 0],
            view: 0,
            filterCategorie: [
                {
                    id: 0,
                    name: '',
                    description: '',
                    slogan: '',
                    phone: 0,
                    catalogImgVO: { description: '' },
                    totalCupones: 0
                }
            ],
            business: [],
            businessFilt: [3],
            businessCard: [3],
            images: [3],
            galleryArray: [3],
            dataCupons: [3],
            page: 1,
            coordsMap: [3],
            flag: false
        };
    }

    componentDidMount = () => {
        this.loadCategoriesCatalog();
        this.init();
    }


    componentDidUpdate = () => {
        document.getElementById('cuponealoLogo').src = logoCup;
    }

    async function init() {
        const res = await this.findCarrusel();

        if (res.data) {
            this.setState({ business: res.data });
            this.setState({ businessCard: res.data });
            this.setState({ filterCategorie: res.data });

            const resp = await this.homePageController.findCoords(res);
            this.setState({ coordsMap: resp }, () => {
                this.filtrar('');

            });
        } else {
            Utils.swalError('No se pudo recuperar la información de negocios.');
        }
        this.countBusinessPerCategory();
        this.pageBusiness(1);

        document.getElementById('cuponealoLogo').src = logoCup;
        this.setState({ flag: true });
    }

    async function findCarrusel() {
        return await this.homePageController.findCarrusel();
    }

    async function loadCategoriesCatalog() {
        const cat = await this.homePageController.findCatalog(
            this.state.categoriesPaged.page
        );
        if (cat.data) {
            this.setState({ categories: cat.data });
            this.setState({
                categoriesPaged: {
                    page: 0,
                    total: cat.total
                }
            });
        } else {
            Utils.swalError('No se pudo recuperar la información de negocios.');
        }
    }

    countBusinessPerCategory = () => {
        const aux = [];
        let aux2 = this.state.business;
        if (document.getElementById('busqueda').value !== '') {
            aux2 = this.state.businessFilt;
        }

        this.state.categories.map((c) => {
            let count = 0;
            for (let i = 0; i < aux2.length; i++) {
                if (c.description === aux2[i].catalogCatVO.description) {
                    count++;
                }
            }
            aux.push(count);

            return null;
        });
        this.setState({
            count: aux
        });
    }

    renderCategories = () => {
        return this.state.categories.map((c, i) => (
            <li
                className='d-flex clickable'
                key={c.id}
                onClick={() => this.openCategorie(c)}
            >
                <View key={c.id} className=' p-2 text-dark'>
                    {c.description + ' (' + this.state.count[i] + ') '}
                </View>
            </li>
        ));
    }

    openCategorie = (c) => {
        const aux = [];

        if (c === 'todas') {
            if (document.getElementById('busqueda').value !== '') {
                this.setState({ filterCategorie: this.state.businessFilt }, () => {
                    this.pageBusiness(1);
                });
            } else {
                this.setState({ filterCategorie: this.state.business }, () => {
                    this.pageBusiness(1);
                });
            }

        } else {
            let bussToGet = this.state.business;
            if (document.getElementById('busqueda').value !== '') {
                bussToGet = this.state.businessFilt;
            }

            for (let i = 0; i < bussToGet.length; i++) {
                if (c.id === bussToGet[i].catalogCatVO.id) {
                    aux.push(bussToGet[i]);
                }
            }

            this.setState({ filterCategorie: aux }, () => {
                this.pageBusiness(1);
            });
        }
    };

    filtrar = (e) => {
        const aux = [];
        const c = e.toLowerCase();

        for (let i = 0; i < this.state.business.length - 1; i++) {
            if (
                this.state.business[i].name.toLowerCase().indexOf(c) !== -1
            ) {
                aux.push(this.state.business[i]);
            }
        }

        if (aux.length < 1) {
            Utils.swalError('Ingrese un criterio distinto...', 'No se encontraron negocios que coincidad!')
        } else {
            this.setState({ filterCategorie: aux }, () => {
                this.setState({ businessFilt: aux }, () => {
                    this.pageBusiness(1);
                    this.countBusinessPerCategory();
                });

            });
        }

    };

    funcModal = (m, opc, typeModal) => {
        let mP = '';
        let mCA = '';

        if (typeModal === 'aviso') {
            mP = document.getElementById('modalPanel');
            mCA = document.getElementById('modalContent');
        } else {
            mP = document.getElementById('modalForm');
            mCA = document.getElementById('modalFormContent');
        }

        if (opc === 'cerrar') {
            mP.setAttribute('style', 'display:none;');
            mCA.setAttribute('style', 'display:none;');
        } else {
            if (m === 'aviso') {
                mP.setAttribute('style', 'display:block;');
                mCA.setAttribute('style', 'display:block;');
            }
        }

        window.scroll({
            top: 0,
            behavior: 'smooth'
        });
    };

    enviarEmail = e => {
        e.preventDefault();
        const messa = '' + document.getElementById('mensaje floatingTextarea').value;

        if (this.validar('nombre floatingInputGrid', 'El nombre solo debe')) {
            if (messa.length < 20) {
                Utils.swl('Tus comentarios nos interesan. Envía un mensaje más largo.');
            } else {
                emailjs.sendForm('service_ibv9k43', 'template_txnd2js', e.target, 'wsrbfhtLY0t0T8s9z').then(res => {
                    if (res.text === 'OK') {
                        Utils.swalSuccess("Sus comentarios fueron enviados con éxito!!");
                        setTimeout(() => {
                            window.location.reload(true);
                        }, 2500);
                    } else {
                        Utils.swalError("No se pudieron enviar sus comentarios, intentelo más tarde.");
                    }
                });
            }
        }
    }

    validar = (idInput, msg) => {
        const input = document.getElementById(idInput);
        const patte = '^[A-Z ]+$';
        const pattern = new RegExp(patte, 'i');

        if (!input.value) {
            Utils.swalError(msg + ' estar vacio!');
            return false;
        } else {
            if (!pattern.test(input.value)) {
                Utils.swalError(msg + ' contener letras o números!');
                return false;
            } else {
                return true;
            }
        }
    }

    orderCoupons = (e) => {
        const list = this.state.filterCategorie;

        if (e === 'ascendente') {
            list.sort(function (a, b) { return b.totalCupones - a.totalCupones });
        } else {
            list.sort(function (a, b) { return a.totalCupones - b.totalCupones });
        }

        this.setState({ filterCategorie: list }, () => {
            this.pageBusiness(1);
        });
    };

    orderName = (e) => {
        const list = this.state.filterCategorie;

        if (e === 'ascendente') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            list.sort((a, b) => b.name.localeCompare(a.name));
        }

        this.setState({ filterCategorie: list }, () => {
            this.pageBusiness(1);
        });
    };

    async function getCategories(option) {
        let page;
        page = this.state.categoriesPaged.page;
        page = option === 1 ? page + 1 : page - 1;
        const cat = await this.homePageController.findCatalog(page);
        if (cat.data) {
            this.setState({
                categories: cat.data,
                categoriesPaged: {
                    page: page,
                    total: cat.total
                }
            });
        } else {
            Utils.swalError('No se pudo recuperar la información de negocios.');
        }
        this.countBusinessPerCategory();
    }

    renderMainContent = () => {
        return (
            this.state.filterCategorie.map((section, i) => {
                return (
                    <BusinessCard c={section} />
                )
            })
        )
    }

    pageBusiness = (page) => {
        const aux = [];
        const aux2 = this.state.filterCategorie;

        for (let i = page * 12 - 12; i < page * 12; i++) {
            if (aux2[i] !== undefined) {
                aux.push(aux2[i]);
            }
        }
        this.setState({
            pagedBusiness: aux,
            page: page
        });
    }

    logo = () => {
        return (
            <View className='navbarS' >
                <View className='row logo'>
                    <View className='p-2 ml-4 mt-4 col-5 col-sm-5 col-md-2 col-lg-2 col-xl-2'>
                        <img
                            src={logoCup}
                            className='ml-4'
                            id='cuponealoLogo'
                            width='120px'
                            alt=''
                        />
                    </View>

                    <View className='p-4 mt-4 col-9 col-sm-9 col-md-7 col-lg-8 col-xl-8'>
                        <input
                            type='text'
                            className='form-control ml-4 col-10'
                            id='busqueda'
                            placeholder='Ingrese su criterio a buscar'
                            aria-describedby='busqueda'
                            required
                        />
                    </View>

                    <View className='p-2 mt-4 col-3 col-sm-3 col-md-3 col-lg-2 col-xl-2'>
                        <Text href="/login" className='btn btn-outline-danger ml-2'>
                            Iniciar sesión
                        </Text>
                    </View>

                </View>
            </View>
        );
    }

    toFooter = () => {
        return (
            <View className='d-flex flex-column h-100 footer'>
                <View className='container py-4'>
                    <View className='row gy-4 gx-5'>
                        <View className='col-lg-4 col-md-6'>
                            <Text className='mb-3 title-footerr'>Cuponealo</Text>
                            <Text className='small text-muted'>
                                Para que pagar el precio completo si puedes...¡Cuponearlo!
                            </Text>
                            <Text className='small text-muted mb-0'>
                                &copy; Copyrights. Todos los derechos reservados. Softitlan.com
                            </Text>
                        </View>

                        <View className='col-lg-2 col-md-6'>
                            <Text className='text-dark mb-3'>Enlaces rápidos</Text>
                            <ul className='list-unstyled text-muted'>
                                <li key='inicio'
                                    className='btnL clickable' onClick={() => { window.location.reload(true) }} >
                                    Inicio
                                </li>
                                <li
                                    key='texto'
                                    onClick={() => this.funcModal('aviso', 'abrir', 'aviso')}
                                    className='btnL clickable'
                                >
                                    Aviso de privacidad
                                </li>
                                <li
                                    key='contacto'
                                    onClick={() => this.funcModal('aviso', 'abrir', 'form')}
                                    className='btnL clickable'
                                >
                                    Contáctanos
                                </li>
                            </ul>
                        </View>

                        <View className='col-lg-2 col-md-6'>
                            <Text className='text-dark mb-3'>Síguenos</Text>
                            <ul className='list-unstyled text-muted'>
                                <li key='facebook'>
                                    <Text href='https://www.facebook.com/profile.php?id=100075633856246'>
                                        Facebook
                                    </Text>
                                </li>
                                <li key='instagram'>
                                    <Text href='https://www.instagram.com/cuponealomx/'>Instagram</Text>{' '}
                                </li>
                                <li key='twitter'>
                                    <Text href='https://twitter.com/Cuponealomx?s=20&t=gxKzbNzAOeqZOrIudIE5yQ'>
                                        Twitter
                                    </Text>
                                </li>
                            </ul>
                        </View>
                    </View>
                </View>
            </View>
        );
    }


    return (
        <ScrollView>
            {this.logo()}

            <View className='sep-home'>
            </View>

            <View className='body-home'>
                <Text className='btn btn-danger'>Button</Text>
            </View>


                <Modal>
                    <Modal.Content>
                        <Modal.CloseButton />
                        <Modal.Header>Política de privacidad</Modal.Header>
                        <Modal.Body>
                            <Text>
                                La presente Política de Privacidad establece los términos en que
                                Softitlan usa y protege la información que es proporcionada por
                                sus usuarios al momento de utilizar su sitio web. Esta compañía
                                está comprometida con la seguridad de los datos de sus usuarios.
                                Cuando le pedimos llenar los campos de información personal con
                                la cual usted pueda ser identificado, lo hacemos asegurando que
                                solo se empleará de acuerdo con los términos de este documento.
                                Sin embargo esta Política de Privacidad puede cambiar con el
                                tiempo o ser actualizada por lo que le recomendamos y
                                enfatizamos revisar continuamente esta página para asegurarse
                                que está de acuerdo con dichos cambios.
                            </Text>

                            <Text>Información que es recogida.</Text>
                            <Text>
                                Nuestro sitio web podrá recoger información personal por
                                ejemplo: Nombre, información de contacto como su dirección de
                                correo electrónico e información demográfica. Así mismo cuando
                                sea necesario podrá ser requerida información específica para
                                procesar algún pedido o realizar una entrega o facturación.
                            </Text>
                            
                            <Text>Uso de la información recogida.</Text>
                            <Text>
                                Nuestro sitio web emplea la información con el fin de
                                proporcionar el mejor servicio posible, particularmente para
                                mantener un registro de usuarios, de pedidos en caso de que
                                aplique, y mejorar nuestros productos y servicios. Es posible
                                que sean enviados correos electrónicos periódicamente a través
                                de nuestro sitio con ofertas especiales, nuevos productos y otra
                                información publicitaria que consideremos relevante para usted o
                                que pueda brindarle algún beneficio, estos correos electrónicos
                                serán enviados a la dirección que usted proporcione y podrán ser
                                cancelados en cualquier momento. 
                                Softitlan está altamente comprometido para cumplir con el
                                compromiso de mantener su información segura. Usamos los
                                sistemas más avanzados y los actualizamos constantemente para
                                asegurarnos que no exista ningún acceso no autorizado.
                            </Text>
                            
                            <Text>Cookies</Text>
                            <Text>
                                Una cookie se refiere a un fichero que es enviado con la
                                finalidad de solicitar permiso para almacenarse en su ordenador,
                                al aceptar dicho fichero se crea y la cookie sirve entonces para
                                tener información respecto al tráfico web, y también facilita
                                las futuras visitas a una web recurrente. Otra función que
                                tienen las cookies es que con ellas las web pueden reconocerte
                                individualmente y por tanto brindarte el mejor servicio
                                personalizado de su web. 
                                Nuestro sitio web emplea las cookies para poder identificar las
                                páginas que son visitadas y su frecuencia. Esta información es
                                empleada únicamente para análisis estadístico y después la
                                información se elimina de forma permanente. Usted puede eliminar
                                las cookies en cualquier momento desde su ordenador. Sin embargo
                                las cookies ayudan a proporcionar un mejor servicio de los
                                sitios web, estás no dan acceso a información de su ordenador ni
                                de usted, a menos de que usted así lo quiera y la proporcione
                                directamente, visitas a una web. Usted puede aceptar o negar el
                                uso de cookies, sin embargo la mayoría de navegadores aceptan
                                cookies automáticamente pues sirve para tener un mejor servicio
                                web. También usted puede cambiar la configuración de su
                                ordenador para declinar las cookies. Si se declinan es posible
                                que no pueda utilizar algunos de nuestros servicios.
                            </Text>
                            
                            <Text>Enlaces a Terceros.</Text>
                            <Text>
                                Este sitio web pudiera contener enlaces a otros sitios que
                                pudieran ser de su interés. Una vez que usted de clic en estos
                                enlaces y abandone nuestra página, ya no tenemos control sobre
                                al sitio al que es redirigido y por lo tanto no somos
                                responsables de los términos o privacidad ni de la protección de
                                sus datos en esos otros sitios terceros. Dichos sitios están
                                sujetos a sus propias políticas de privacidad por lo cual es
                                recomendable que los consulte para confirmar que usted está de
                                acuerdo con estas.
                            </Text>
                            
                            <Text>Control de su información personal.</Text>
                            <Text>
                                En cualquier momento usted puede restringir la recopilación o el
                                uso de la información personal que es proporcionada a nuestro
                                sitio web. Esta compañía no venderá, cederá ni distribuirá la
                                información personal que es recopilada sin su consentimiento,
                                salvo que sea requerido por un juez con un orden judicial.
                            </Text>
                            
                            
                            <Text>
                                Softitlan se reserva el derecho de cambiar los términos de la
                                presente Política de Privacidad en cualquier momento.
                            </Text>
                            
                        </Modal.Body>
                        <Modal.Footer>
                            <TouchableHighlight variant="ghost" colorScheme="blueGray">
                                Cancel
                            </TouchableHighlight>
                            <TouchableHighlight>
                                Save
                            </TouchableHighlight>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>

            <View className='container-fluid'>
                <View className='row'>
                    <View className='col-lg-7 col-md-6 col-sm-6 text-dark align-self-center mt-4'>
                        <View className='subtitleText'>
                            Para que pagar el precio completo si puedes...
                        </View>
                    </View>

                    <View className='col-lg-5 col-md-6 col-sm-6 mt-4'>
                        <View className='titleText'>¡CUPONEARLO!</View>
                    </View>
                </View>
            </View>

            <View className='container-fluid'>
                <View className='row'>
                    <View className='my-3 col-sm-0 col-md-0 col-lg-0 col-xl-1 col-0'></View>
                    <View className='my-3 col-sm-12 col-md-3 col-lg-3 col-xl-2 menu-container'>
                        <input type="checkbox" />
                        <TouchableHighlight className='ml-3'></TouchableHighlight>
                        <TouchableHighlight className='ml-3'></TouchableHighlight>
                        <TouchableHighlight className='ml-3'></TouchableHighlight>
                        <View className='menu'>
                            <View className='row'>
                                <ul className='d-flex mx-3 flex-column'>
                                    <View className='p-2 text-danger mt-3'>Filtrar por categoría</View>
                                    <li
                                        className='d-flex clickable'
                                        onClick={() => this.openCategorie('todas')}
                                    >
                                        {this.state.business.length !== 0 ?
                                            <View className='button p-2 text-dark'>
                                                Todas ({document.getElementById('busqueda').value !== '' ?
                                                    this.state.businessFilt.length
                                                    :
                                                    this.state.business.length
                                                }){' '}
                                            </View>
                                            :
                                            <></>
                                        }
                                    </li>
                                    {this.renderCategories()}
                                    <li className='my-3 d-flex justify-content-left'>
                                        <View className='d-flex flex-row'>
                                            <View className='d-flex flex-column'>
                                                <View
                                                    className={
                                                        this.state.categoriesPaged.page > 0
                                                            ? 'button btn btn-outline-danger'
                                                            : '  btn btn-outline-danger disabled'
                                                    }
                                                    onClick={
                                                        this.state.categoriesPaged.page > 0
                                                            ? () => this.getCategories(0)
                                                            : null
                                                    }
                                                >
                                                    {'<-'}
                                                </View>
                                            </View>
                                            <View
                                                className='d-flex flex-column'
                                                style={{ paddingLeft: '10px' }}
                                            >
                                                <View
                                                    className={
                                                        (this.state.categoriesPaged.page + 1) * 8 <
                                                            this.state.categoriesPaged.total
                                                            ? '  btn btn-outline-danger'
                                                            : '  btn btn-outline-danger disabled'
                                                    }
                                                    onClick={
                                                        (this.state.categoriesPaged.page + 1) * 8 <
                                                            this.state.categoriesPaged.total
                                                            ? () => this.getCategories(1)
                                                            : null
                                                    }
                                                >
                                                    {'->'}
                                                </View>
                                            </View>
                                        </View>
                                    </li>
                                </ul>
                            </View>

                            <View className='row'>
                                <ul className='d-flex mx-3 flex-column'>
                                    <View className='p-2 text-danger mt-3'>Ordenar negocios</View>
                                    <li
                                        className='d-flex clickable'
                                        onClick={() => this.orderCoupons('ascendente')}
                                    >
                                        <View className='  p-2 text-dark'>
                                            Cupones (^)
                                        </View>
                                    </li>
                                    <li
                                        className='d-flex clickable'
                                        onClick={() => this.orderCoupons('descendente')}
                                    >
                                        <View className='  p-2 text-dark'>
                                            Cupones (v)
                                        </View>
                                    </li>

                                    <li
                                        className='d-flex clickable'
                                        onClick={() => this.orderName('ascendente')}
                                    >
                                        <View className='  p-2 text-dark'>
                                            Nombre (^)
                                        </View>
                                    </li>
                                    <li
                                        className='d-flex clickable'
                                        onClick={() => this.orderName('descendente')}
                                    >
                                        <View className='  p-2 text-dark'>
                                            Nombre (v)
                                        </View>
                                    </li>
                                </ul>
                            </View>
                        </View>
                    </View>
                    <View className='my-3 col-sm-12 col-md-9 col-lg-8 col-xl-8 col-12'>

                        <View className='p-4 my-4'>
                            {this.renderMainContent()}
                        </View>


                        <View className='my-3 d-flex justify-content-left'>
                            <View className='d-flex flex-row'>
                                <View className='d-flex flex-column'>
                                    <View
                                        className={
                                            this.state.page > 1
                                                ? '  btn btn-outline-danger'
                                                : '  btn btn-outline-danger disabled'
                                        }
                                        onClick={
                                            this.state.page > 1
                                                ? () => this.pageBusiness(this.state.page - 1)
                                                : null
                                        }
                                    >
                                        Anterior
                                    </View>
                                </View>
                                <View
                                    className='d-flex flex-column'
                                    style={{ paddingLeft: '10px' }}
                                >
                                    <View
                                        className={
                                            this.state.page * 12 <
                                                this.state.filterCategorie.length
                                                ? '  btn btn-outline-danger'
                                                : '  btn btn-outline-danger disabled'
                                        }
                                        onClick={
                                            this.state.page * 12 <
                                                this.state.filterCategorie.length
                                                ? () => this.pageBusiness(this.state.page + 1)
                                                : null
                                        }
                                    >
                                        Siguiente
                                    </View>
                                </View>
                                <Text className='ml-3 pt-2'>
                                    Página {this.state.page} de{' '}
                                    {Math.ceil(this.state.filterCategorie.length / 12)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

        </ScrollView>
    )
}

export default HomePage
