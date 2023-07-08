import React, {useEffect, useRef, useState} from 'react';
import {classNames} from 'primereact/utils';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Card} from 'primereact/card';
import {Toolbar} from 'primereact/toolbar';
import {InputText} from "primereact/inputtext";
import {Button} from 'primereact/button';
import axios, {Axios} from 'axios';
import {Badge} from 'primereact/badge';
import {ScrollTop} from 'primereact/scrolltop';
import {Dialog} from 'primereact/dialog';
import { Toast } from 'primereact/toast';

export default function ConditionalStyleDemo() {
    const [totalSalesPrice, setTotalSalesPrice] = useState(0);
    const [data, setData] = useState([]);
    const inputRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorMessageStok, setErrorMessageStok] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage1, setErrorMessage1] = useState(null);
    const [errorMessage2, setErrorMessage2] = useState(null);
    const [displayDialog, setDisplayDialog] = useState(false);
    const DataTableRef = useRef(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isButtonEnabled, setIsButtonEnabled] = useState(hasData());
    const bilgi = useRef(null);
    const emptyMessage = "Tabloda ürün bulunmamaktadır!";

    useEffect(() => {
        const handleKeyPress = (event) => {
          if (event.code === 'Enter') {
            inputRef.current?.focus();
          }
        };
    
        document.addEventListener('keydown', handleKeyPress);
    
        return () => {
          document.removeEventListener('keydown', handleKeyPress);
        };
      }, []);
    
    const stockBodyTemplate = (rowData) => {
        const stockClassName = classNames('border-circle w-2rem h-2rem inline-flex font-bold justify-content-center align-items-center text-sm', {
            'bg-red-100 text-red-900': rowData.piece === 0,
            'bg-blue-100 text-blue-900': rowData.piece > 0 && rowData.piece <= 10,
            'bg-teal-100 text-teal-900': rowData.piece > 10
        });

        return <div className={stockClassName}>{rowData.piece}</div>;
    };


    const tlSimgesiEkle = (rowData) => {
        const totalPrice = rowData.piece * rowData.stock_price;
        const formatPrice = `₺${totalPrice.toFixed(2)}`;
        return (
            <strong>{formatPrice}</strong>
        );
    };


    const handleButtonClick = () => {
        const barcodeNo = inputRef.current.value.trim();

        if (!barcodeNo) {
            setErrorMessage('Barkod numarası boş olamaz. Ürün satışı gerçekleştirmek için barkod numarası okutunuz veya elle giriniz!');
            return;
        }

        const existingItemIndex = data.findIndex((product) => product.barcode_no === barcodeNo);

        if (existingItemIndex > -1) {

            const lastItemIndex = data.findLastIndex((product) => product.barcode_no === barcodeNo);
            const currentItem = data[lastItemIndex];

            if (currentItem.max_stock < currentItem.piece + 1) {
                // setErrorMessageStok('Stokta yeterli ürün yok.');

                // fiyata göre stoğun indis değerini bul
                let currentItemStockId = currentItem.product_stocks.findIndex((item) => item?.stock_price === currentItem.stock_price);

                if (currentItemStockId === -1) {
                    setErrorMessageStok('Stokta yeterli ürün bitmiştir!');
                    return;
                }
                // delete currentItem.product_stocks[currentItemStockId]; // stoğu sil
                currentItem.product_stocks[currentItemStockId].status = true;

                // silinen stoktan sonraki diğer stoğun id al
                let nextStockId = currentItem.product_stocks.findIndex((item) => !item.status)
                const nextStock = currentItem.product_stocks[nextStockId];

                if (!nextStock) {
                    setErrorMessageStok('Stokta yeterli ürün bitmiştir!');
                    return;
                }

                let nextItem = {
                    ...currentItem,
                    stock_price: nextStock.stock_price,
                    max_stock: nextStock.quantity,
                    stock_id: nextStock.id,
                    piece: 1,
                };

                setData([...data, nextItem])

                    bilgi.current.show({ severity: 'warn', summary: 'Stok Uyarısı', detail: 'Seçilen ürünün diğer stoklarından düşüm yapılacaktır. Fiyatlar farklılık gösterebilir!', life: 10000 });

                inputRef.current.value = '';
                inputRef.current.focus();
                return;
            }

            const updatedData = [...data];
            currentItem.piece += 1;
            setData(updatedData);


            inputRef.current.value = '';
            inputRef.current.focus();
            return;
        }


        axios.get(`http://localhost:8000/api/barcode?barcode_no=${barcodeNo}`)
            .then((response) => {
                const product = response.data.data;
                const stock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;

                if (!stock) {
                    setErrorMessageStok('Stok bulunamadı.');
                    return;
                }

                const newItem = {
                    product_id: product.id, // gönderilecek veri
                    barcode_no: product.barcode_no,
                    product_name: product.product_name,
                    piece: 1, // gönderilecek veri
                    stock_price: stock.stock_price,
                    max_stock: stock.quantity,
                    stock_id: stock.id, // gönderilecek veri
                    product_stocks: product.stocks,
                }

                stock.status = stock.quantity === 1; // stok durumu takip etme


                // tabloya ekleme
                setData([...data, newItem]);
                setErrorMessage(null);
            })
            .catch((error) => {
                console.warn("satış butonu :>>", error)
                setErrorMessage('Barkod sistemde bulunmamaktadır. Tekrar Deneyin.');
            });

        inputRef.current.value = '';
        inputRef.current.focus();
    };

    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleButtonClick();
        }
    };

    React.useEffect(() => {
        inputRef.current.focus();
    }, []);

    const solToolbarTemplate = () => {
        return (
            <div className="card flex flex-column md:flex-row" style={{minWidth: '35rem'}}>
                <div className="p-inputgroup flex-1">
                    <Button label="Ekle" raised onClick={handleButtonClick}/>
                    <InputText placeholder="Barkodu okutun veya elle giriniz..." autoFocus ref={inputRef}
                               id="barcodeInput" onKeyDown={handleInputKeyDown} required/>
                </div>
            </div>
        );
    };

    const isPositiveInteger = (val) => {
        let str = String(val);

        str = str.trim();

        if (!str) {
            return false;
        }

        str = str.replace(/^0+/, '') || '0';
        let n = Math.floor(Number(str));

        return n !== Infinity && String(n) === str && n >= 0;
    };

    const onCellEditComplete = (e) => {
        let {rowData, newValue, field, originalEvent: event} = e;

        switch (field) {
            case 'piece':
                if (isPositiveInteger(newValue)) rowData[field] = newValue;
                else event.preventDefault();

                setTotalSalesPrice(basketTotal)
                break;

            default:
                if (newValue.trim().length > 0) rowData[field] = newValue;
                else event.preventDefault();
                break;
        }
    };

    const cellEditor = (options) => {
        if (options.field === 'piece') return textEditor(options);
    };

    const textEditor = (options) => {
        //return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(Number(e.target.value))} />;
        return <InputText type="text" value={options.value}
                          onChange={(e) => onEditorValueChange(options, Number(e.target.value))}/>;
    };

    const onEditorValueChange = (options, value) => {
        const {rowData, editorCallback} = options;

        if (value <= rowData?.max_stock) {
            editorCallback(value);

            let stockID = rowData.product_stocks.findIndex((item) => item.id === rowData.stock_id);

            if (value === rowData?.max_stock) {
                rowData.product_stocks[stockID].status = true;
            } else {
                rowData.product_stocks[stockID].status = false;
            }

            return;
        }
        setErrorMessage2('En fazla ' + rowData?.max_stock + ' adet ürün seçebilirsiniz. Yazdığınız tutar stokta bulunan miktarı aşmaktadır.');

    }

    const sagToolbarTemplate = () => {
        return (
            <div className="card flex flex-wrap justify-content-center gap-2">
                <h4 className="text-justify mt-3">Barkodsuz Ürünler</h4>
                <Button label="Kahve" raised icon="pi pi-check" tooltip="Kahve Ekle"
                        tooltipOptions={{position: 'bottom', mouseTrack: true, mouseTrackTop: 15}}/>
                <Button label="Simit" raised icon="pi pi-check" tooltip="Simit Ekle"
                        tooltipOptions={{position: 'bottom', mouseTrack: true, mouseTrackTop: 15}}/>
                <Button label="Poğaça" raised icon="pi pi-check" tooltip="Poğaça Ekle"
                        tooltipOptions={{position: 'bottom', mouseTrack: true, mouseTrackTop: 15}}/>
            </div>
        )
    };

    const handleCancel = () => {
        setDisplayDialog(false);
    };

    const handleConfirm = () => {
        setData([]);
        setDisplayDialog(false);
    };


    // Satışı Tamamla Butonu disabled-enabled fonksiyonları

    function hasData() {
        return data.length > 0;
    }

    useEffect(() => {
        setIsButtonEnabled(hasData());
    }, [data]);

    // Satışı Tamamla Butonu disabled-enabled fonksiyonları -----------BİTİŞ

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Satışı Tamamla" raised icon="pi pi-shopping-cart" disabled={!isButtonEnabled}
                        onClick={tablodakiSatisiTamamla} severity="success"/>
                <Button label="Satış İptal" raised disabled={isButtonDisabled} onClick={() => setDisplayDialog(true)}
                        icon="pi pi-trash" severity="danger"/>
            </div>
        );
    };


    useEffect(() => {
        setTotalSalesPrice(basketTotal)
    }, [data])

    const basketTotal = () => {
        const total = data.reduce((acc, item) => {
            const itemTotal = Number(item.stock_price) * item.piece;
            return acc + itemTotal;
        }, 0);

        return total.toFixed(2);
    };
    const rightToolbarTemplate = (
        <>
            {totalSalesPrice > 0 &&
                <div className="flex align-items-center mt-3 justify-content-end gap-2">
                    <h2>Toplam Tutar: <Badge
                        value={"₺ " + totalSalesPrice} size="xlarge" severity="danger"></Badge></h2>
                </div>
            }
        </>
    );

    const deleteRow = (rowData) => {
        const index = data.indexOf(rowData);
        let updatedData = [...data];
        updatedData.splice(index, 1);
        setData(updatedData);
    };


    const isButtonDisabled = data.length === 0;


    const tablodakiSatisiTamamla = () => {

        axios.post('http://localhost:8000/api/basket/', {"basket_items": data})
            .then(() => {
                setSuccessMessage("Satış Başarıyla Tamamlandı.");
                setData([]);
            })
            .catch(error => {
                console.log("error:>>", error);
                alert("Satış Başarısız.");
            })

    };

    const handleCloseDialog = () => {
        if (inputRef.current) {
            setSuccessMessage(null)
            inputRef.current.focus();
        }
    };

    const handleCloseDialog2 = () => {
        if (inputRef.current) {
            setErrorMessage(null)
            inputRef.current.focus();
        }
    };
    const handleCloseDialog4 = () => {
        if (inputRef.current) {
            setErrorMessage2(null)
            inputRef.current.focus();
        }
    };
    const handleCloseDialog5 = () => {
        if (inputRef.current) {
            setErrorMessageStok(null)
            inputRef.current.focus();
        }
    };
    const handleCloseDialog3 = () => {
        if (inputRef.current) {
            setErrorMessage1(null)
            inputRef.current.focus();
        }
    };

    return (
        <>
            <div className="card">
                <Card title="Ürün Satış Sayfası">
                    <Toolbar className="mb-4" left={solToolbarTemplate} right={sagToolbarTemplate}/>
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}/>
                    <Dialog visible={displayDialog} onHide={handleCancel} header="Satışı İptal Et" footer={
                        <>
                            <Button label="İptal" icon="pi pi-times" onClick={handleCancel}/>
                            <Button label="Onayla" severity="danger" icon="pi pi-check" onClick={handleConfirm}
                                    autoFocus/>
                        </>
                    }
                    >
                        <p>Satışı iptal etmek istediğinize emin misiniz ?</p>
                    </Dialog>
                    <DataTable value={data} ref={DataTableRef} selection={selectedSale}
                               tableStyle={{minWidth: '50rem'}} emptyMessage={emptyMessage}>
                        <Column field="barcode_no" header="Barkod Numarası"/>
                        <Column field="product_name" header="Ürün İsmi"/>
                        <Column field="piece" style={{width: '20%'}} editor={(options) => cellEditor(options)}
                                onCellEditComplete={onCellEditComplete} header="Aldığı Miktar"
                                body={stockBodyTemplate || actionTemplate}/>
                        <Column field="min_price" body={tlSimgesiEkle} header="Ürün Satış Fiyatı"/>
                        <Column header="Ürünü Sil" style={{width: '9%'}}
                                body={(rowData) => <Button icon="pi pi-trash" onClick={() => deleteRow(rowData)}/>}/>
                    </DataTable>

                </Card>
                <ScrollTop target="parent" threshold={100} className="w-2rem h-2rem border-round bg-primary"
                           icon="pi pi-arrow-up text-base"/>
                <Toast ref={bilgi} />
                <Dialog header="Barkod veya Stok Bulunamadı" icon="pi pi-times" visible={errorMessage !== null}
                        style={{width: '40vw'}} onHide={handleCloseDialog2}>
                    <p className="m-0">
                        {errorMessage}
                    </p>
                </Dialog>
                <Dialog header="Fazla Stok Satışı!" icon="pi pi-times" visible={errorMessage2 !== null}
                        style={{width: '30vw'}} onHide={handleCloseDialog4}>
                    <p className="m-0">
                        {errorMessage2}
                    </p>
                </Dialog>
                <Dialog header="Stok Sınırına Ulaşıldı!" icon="pi pi-times" visible={errorMessageStok !== null}
                        style={{width: '30vw'}} onHide={handleCloseDialog5}>
                    <p className="m-0">
                        {errorMessageStok}
                    </p>
                </Dialog>
                <Dialog header="Barkod girin" icon="pi pi-times" visible={errorMessage1 !== null}
                        style={{width: '30vw'}} onHide={handleCloseDialog3}>
                    <p className="m-0">
                        {errorMessage1}
                    </p>
                </Dialog>
                <Dialog header="Satış Başarılı" visible={successMessage !== null} style={{width: '20vw'}}
                        onHide={handleCloseDialog}>
                    <p className="m-0">
                        {successMessage}
                    </p>
                </Dialog>
            </div>
        </>
    );
}
