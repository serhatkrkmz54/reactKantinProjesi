import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Accordion, AccordionTab } from 'primereact/accordion';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export default function PresortDemo() {
    const [stok, setStok] = useState([]);
    const [barcode_no, setbarcodeNo] = useState("");
    const [product_name, setproductName] = useState("");
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const [visible1, setVisible1] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [urunEkle, setUrunEkle] = useState(false);
    const [deletedProductId, setDeletedProductId] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anaTabloLoading, setAnaTabloLoading] = useState(true);
    const [sss, setSss] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    //Veri girişi yaparak veritabanına gönderdiğimiz komut satırları...

    const handleSubmit = (event) => { //Ürün Ekleme Form'una hook.
        event.preventDefault();
        axios.post('http://localhost:8000/api/product/', { barcode_no, product_name })
          .then(res => {
            let data = {...res.data.data}
            console.log("serhat>>", data);
            toast.current.show({ severity: 'success', summary: 'Ürün Eklendi', detail: 'Yeni ürün başarıyla eklendi.' });
            setUrunEkle(false);
            setStok([data, ...stok])  
          })
          .catch(error => {
            console.error(error);
          });
            }
            const onEditClick = (rowData) => {
              setSelectedRow(rowData);
              setVisible1(true);
              setEditedData({...editedData, product_id: rowData.id})
            };
            
            const onHide1 = () => {
              setVisible1(false);
              setSelectedRow(null);
            };

      //Veri girişi yaparak veritabanına gönderdiğimiz komut satırları... --Bitiş

      //Datatableye verileri getirdiğimiz yer...

      useEffect(() => {
       getAllStock(); //Alttaki tanımlamayı useeffect ile buraya hookladık.
        }, []);

        const getAllStock = () => {  //Hooklamak istediğimiz yani güncellemeyi almak istediğimiz kısmı burada get axios ile aldık.
          axios.get(`http://localhost:8000/api/product/`)
          .then((res) => {
            setStok(res.data.data)
            setAnaTabloLoading(false);
            const reversedData = res.data.data.reverse();
            setStok(reversedData);
          //  console.log(res.data.data)
          });
        }

      //Datatableye verileri getirdiğimiz yer... --Bitiş

    //Datatabledeki sil butonunun işlev satırları

      const onDeleteClick = (rowData) => {
        setSelectedItem(rowData);
        setConfirmDialogVisible(true);
      };
    

      const onDeleteConfirm = () => {
        axios.delete(`http://localhost:8000/api/product/${selectedItem.id}`)
          .then(() => {
            setConfirmDialogVisible(false);
            setDeletedProductId(selectedItem.id);
            setStok(stok.filter((p) => p.id !== selectedItem.id));
            toast.current.show({
              severity: 'error',
              summary: 'Başarılı',
              detail: 'Ürün başarıyla silindi.',
              life: 2000
            });
          })
          .catch(() => {
             console.log(error);
          });
      };
      const onDeleteCancel = () => {
        setConfirmDialogVisible(false);
      };

      const confirmDialogFooter = (
        <>
          <Button label="Evet" icon="pi pi-check" onClick={onDeleteConfirm} className="p-button-danger"/>
          <Button label="Hayır" icon="pi pi-times" onClick={onDeleteCancel} className="p-button-primary" />
        </>
      );
      
        //Datatabledeki sil butonunun işlev satırları --Bitiş

    const tlSimgesiEkle = (rowData) => { 
        const formatPrice = `₺${rowData.stock_price}`;
        return (
            <span>{formatPrice}</span>
        );
     }; 

    const tableColumnEdit = (product) => {
      setVisible(true);
      setSelectedItem(product);
      // console.log("seçilen ürün :>>", product);
    };

    const selectedItemUpdated = () => {
      
      axios.put(`http://localhost:8000/api/product/${selectedItem.id}`, selectedItem)
          .then((res) => {
            if (res.data.status === "success") {
             let arrKey =  stok.findIndex((item) => item.id === selectedItem.id)
             stok[arrKey] = selectedItem;
             toast.current.show({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Ürün başarıyla güncellenmiştir.',
              life: 2000
            });
             setVisible(false);
            }
          })
          .catch((error) => {
            // handle error
            // console.log(error);
          });
    }
    
      //İnput focus yaptırdığımız yer... --Bitiş

      //Pdf ve Excel olarak çıktıları aldığımız kod satırları

      const cols = [
        { header: 'Barkod Numarasi', dataKey: 'barcode_no' },
        { header: 'Ürün Ismi', dataKey: 'product_name' },
        { header: 'Toplam Stok', dataKey: 'stock_quantity' },
        { header: 'Urun Giris Tarihi', dataKey: 'product_date' },
      ];


      const exportColumns = cols.map((col) => ({ title: col.header, dataKey: col.dataKey }));

    const exportPdf = () => {
      import('jspdf').then((jsPDF) => {
        import('jspdf-autotable').then((autoTable) => {
          const doc = new jsPDF.default(0, 0);
          const tableHeader = exportColumns.map((col) => col.title);
          const tableData = stok.map((item) => exportColumns.map((col) => item[col.dataKey]));
    
          autoTable.default(doc, {
            head: [tableHeader],
            body: tableData,
          });
          
          doc.save('products.pdf');
        });
      });
    };


    const exportToExcel = (data) => {
      const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const fileExtension = '.xlsx';
      const fileName = 'myExcelFile';
      const formattedData = data.map((item) => ({
        'Barkod Numarası': item.barcode_no,
        'Ürün İsmi': item.product_name,
        'Toplam Stok': item.stock_quantity,
        'Ürün Giriş Tarihi': item.product_date,
      }));
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const columnWidths = [
        { wch: 20 },
        { wch: 30 },
        { wch: 20 },
        { wch: 20 }
      ];
      ws["!cols"] = columnWidths;
      ws["!outline"] = true; // Kenarlıkları kalınlaştır
      ws['A1'].s = { font: { bold: true } };
      ws['B1'].s = { font: { bold: true } };
      ws['C1'].s = { font: { bold: true } };
      ws['D1'].s = { font: { bold: true } };
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataExcel = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(dataExcel, fileName + fileExtension);
    };
    // Yeni Ürün Ekleme butonunun tetikleme işlevleri 

    const handleClick = () => {
        setUrunEkle(true);
      };
    
      const onHide = () => {
        setUrunEkle(false);
      };

      const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Yeni Ürün Ekle" raised icon="pi pi-plus" severity="success" onClick={handleClick}/>
                <Button label="Ürün Ekleme Rehberi" onClick={() => setSss(true)} raised icon="pi pi-question-circle" severity="warning" tooltip="Ürün Ekleme Rehberini görmek için tıklayınız" tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}/>
            </div>
        );
    };

    // Yeni Ürün Ekleme butonunun tetikleme işlevleri -------BİTİŞ

    // Arama kutusu bu kısımda

    const rightToolbarTemplate = () => {
        return  <span className="p-input-icon-left"><i className="pi pi-search" /><InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Ürün arayın..." />
                </span>;
    };

    // Arama kutusu ------BİTİŞ

    // Pdf ve Excel olarak çıktıları aldığımız kod satırları

    const header = (

      <div className="flex align-items-center justify-content-end gap-2">
            <Button type="button" raised severity="primary" rounded onClick={() => getAllStock()}  icon="pi pi-refresh" />
            <Button type="button" raised icon="pi pi-file-excel" severity="success" tooltip="Excel Döküm Al" tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} rounded onClick={() => exportToExcel(stok)}/>
            <Button type="button" raised icon="pi pi-file-pdf" severity="warning" tooltip="PDF Döküm Al" tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }} rounded onClick={exportPdf}/>
      </div>
    );

        // Pdf ve Excel olarak çıktıları aldığımız kod satırları... --Bitiş
        
        const imageBodyTemplate = () => {
            return <img src="/layout/images/product.jpg" className="shadow-2 border-round" style={{ width: '85px' }} />;
        };

        // Genel Stok görüntüleme kısmında filtreleme ve kolon arkaplan rengi belirleme işlemlerinin yapıldığı yer

        function getBrandClassName(rowData) {
            const number = rowData.stock_quantity;
            if (number > 0) {
              return "green-background";
            } else {
              return "red-background";
            }
          }
          function stockQuantityBodyTemplate (rowData) {
            if (rowData.stock_quantity < 1) {
              return "Ürün stoğu yok";
            }
            return rowData.stock_quantity;
          }

        // Genel Stok görüntüleme kısmında filtreleme ve kolon arkaplan rengi belirleme işlemlerinin yapıldığı yer ---------BİTİŞ

          // Stok Ekleme Butonu ile yaptırdığımız stok ekleme

          const onStockEdit = async (e) => {
           await e.preventDefault();
              setIsButtonDisabled(true); // Butonu devre dışı bırakır
              const data = {...editedData/*, invoice_date: invoice_date*/}
              axios.post("http://localhost:8000/api/stock/", data)
              .then(() => {
                setIsButtonDisabled(false);
                toast.current.show({ severity: 'success', summary: 'Stok Eklendi', detail: 'Yeni stok başarıyla eklendi.' });
                setVisible1(false);
                let productKey = stok.findIndex(item => item.id === data.product_id);
                stok[productKey].stock_quantity += Number(data.quantity)
              });
          }

          // Stok Ekleme Butonu ile yaptırdığımız stok ekleme -------BİTİŞ


          const onRowClick1 = (event) => {
            // Seçilen ürünü alın
            const selectedProduct = event.data;
        
            // Seçilen ürünün stok verilerini alın
            axios.get(`http://localhost:8000/api/stock/product/${selectedProduct.id}`)
              .then((res) => {
                setStockData(res.data.data)
                let stockVerileri = {...res.data.data}
                console.log("serhat>>>>", stockVerileri)
                setLoading(false);
              });
            // Dialog kutusunu gösterin
            setDialogVisible(true);
            setSelectedProduct(selectedProduct);
          };
        
          // Diyalog kutusunu kapatır
          const hideDialog1 = () => {
            setDialogVisible(false);
          };

    return (
        <div className="card">
            <Card title="Malzeme Giriş / Güncelleme">
              {/* Ürün Ekleme rehberinin dialog'u  */}
            <Dialog header="Ürün Ekleme Sistemi Hakkında Bilgiler" maximizable visible={sss} style={{ width: '50vw' }} onHide={() => setSss(false)}>
            <Accordion multiple activeIndex={[0]}>
                <AccordionTab header={ <div className="flex align-items-center">
                <i className="pi pi-box mr-2"></i>
                <span className="vertical-align-middle">Malzeme Giriş/Güncelleme Ekranı Genel Bakış</span>
            </div>}>
                    <p className="m-0">
                      <p>
                        Malzeme Giriş ekranındaki tabloda girilen ürünlerin <b>Barkod Numarası, Ürünün ismi, Toplam Stoğu, Ürünün sisteme kaydedilme tarihi</b> yer almaktadır.
                        Tabloya ayrıca ürünlere yeni stok geldiğinde stok ekleme, ürünün ismini düzenleme ve ürün silme gibi işlevler eşlik etmektedir.</p>
                        <Message severity="warn" text="Tablodaki 'Toplam Stok' sütununda ürünün tüm girilen stokları toplanarak eklenmiş olup tamamı gösterilmektedir." className="mt-3 mb-5 p-4"/>
                        <p>
                        Sağ üstteki <Button type="button" raised icon="pi pi-file-excel" severity="success" rounded /> <Button type="button" raised icon="pi pi-file-pdf" severity="warning" rounded /> butonlarından yeşil olan ile Excel dökümü, turuncu olan kısımdan PDF dökümü alabilirsiniz.</p>
                        <Message severity="error" text="Eğer girdiğiniz veya güncellediğiniz veri sistem hatasından dolayı tabloya yansımıyorsa tablonun sol altındaki yenile butonuna tıklayarak verilerin güncel halini alabilirsiniz." className="mt-3 mb-5 p-4" />
                        <p>
                          Tabloda minimum gösterilecek ürün sayısı 10'dur. Alt kısımdan sıralama sayısını seçerek yükseltebilirsiniz. <br></br>
                          <b>Tablodaki herhangi bir ürünün üstüne tıklandığında bir pencere açılacak bu pencerede ürüne ait diğer stokları ve o stokların satış fiyatı ile fatura tarihi görüntülenir.</b>
                          <br></br>Ürün arama kısmında ürüne ait herhangi bir bilgiyi yazarak getirme özelliği eklenmiştir. Tablodaki <i>Toplam Stok</i> sütununda bir ürünün toplam stoğu 0 olduğunda otomatik olarak arkaplanı kırmızı renge dönüşecektir. 0'ın üstünde olması durumunda yeşil renk alacaktır.
                        </p>
                        <p> <Message severity="info" text="Bir ürün eklendiğinde veya bir ürüne ait güncelleme, silme işlemi yapıldığında sağ üstte başarılı mesajını görmeden herhangi bir işlemi tekrar yaptırmayın. Sürekli butona basarak sisteme gereksiz ve fazladan veri gönderimi yapmayın." className="mt-3 mb-5 p-4"  /> </p>
                    </p>
                </AccordionTab>
                <AccordionTab header={ <div className="flex align-items-center">
                <i className="pi pi-plus mr-2"></i>
                <span className="vertical-align-middle">Yeni Ürün Ekle Butonu</span>
            </div>}>
                    <p className="m-0">
                        Gelen ürünün ilk girişi buradan yapılacaktır. Butona tıklandığında açılan pencerede Barkod numarasını barkod cihazı ile düzgün bir şekilde okutmanız gerekmektedir. Ürün adınıda yazarak Ürünü oluştur butonuna bastıktan sonra "başarılı" mesajını bekledikten sonra ürün tabloya yansıyacaktır.
                        <Message severity="error" text="Barkod numarasını barkod cihazı ile dikkatlice ve düzgün bir şekilde okutup veya yazmalısınız. Barkod numarası ürünü ekle butonuna bastıktan sonra DEĞİŞTİRİLEMEZ!" className="mt-3 mb-5 p-4" />
                    </p>
                </AccordionTab>
                <AccordionTab header={ <div className="flex align-items-center">
                <i className="pi pi-caret-up mr-2"></i>
                <span className="vertical-align-middle">Yeni Stok Düğmesi</span>
            </div>}>
                    <p className="m-0">
                        Tabloda sağ tarafta ilk sırada <b>"yukarı ok"</b> şeklinde yer alan düğmedir. <br></br>
                        Tabloda hangi ürünün sırasında bu butona tıklarsanız o ürüne ait stok eklemek için bir pencere açılacaktır. Bu pencereden gelen ürünün yeni stoğu ve o stoğun satış fiyatını yazmak için kısımlar açılacaktır.    
                        <Message severity="error" text="Eklenen stoklar sonradan silinemez. Bu yüzden stok girmeden önce dikkatlice inceleyip işlem yapınız." className="mt-3 mb-5 p-4" />
                    </p>
                </AccordionTab>
                <AccordionTab header={ <div className="flex align-items-center">
                <i className="pi pi-pencil mr-2"></i>
                <span className="vertical-align-middle">Düzenle Düğmesi</span>
            </div>}>
                    <p className="m-0">
                        Tabloda sağ tarafta ortada bulunan butondur. Bu butona tıklandığında yine bir pencere açılır ve barkod numarası "düzenlenemez" şekilde açılır sadece ürün ismi düzenlenebilir.
                    </p>
                </AccordionTab>
                <AccordionTab header={ <div className="flex align-items-center">
                <i className="pi pi-trash mr-2"></i>
                <span className="vertical-align-middle">Sil Düğmesi</span>
            </div>}>
                    <p className="m-0">
                        Tabloda en sağda bulunan çöp kutusu simgesinde gözüken düğmedir. Seçilen satırdaki ürünü sadece tablodan siler. Girilen bir ürün daha sonradan silinemez. Tıklandığında bir uyarı penceresi ile iki kere uyarılır. Çünkü yapılan işlem bir daha geri alınamaz.
                    </p>
                </AccordionTab>
            </Accordion>
            </Dialog>
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <Toast ref={toast} />
                {anaTabloLoading && <ProgressSpinner style={{width: '50px', height: '50px', top: '25%', left: '50%', position: 'fixed'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />}
                <DataTable value={stok} onRowClick={onRowClick1} sortField="price" header={header} paginator rows={20} rowsPerPageOptions={[20, 60, 100, 200]} paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        currentPageReportTemplate="{first} ile {last} arasında toplam {totalRecords} ürün gösteriliyor." sortOrder={-1} globalFilter={globalFilter} >
                    <Column field="image" header="Ürün Resmi" style={{ width: '7%' }} body={imageBodyTemplate}></Column>
                    {/* <Column field="columnLink" header="Stok Bilgileri" body={(rowData) => (<Button onClick={() => setVisible2(true)}>Stok</Button>)} /> */}
                    <Column field="barcode_no" header="Barkod Numarası" sortable style={{ width: '14%' }}></Column>
                    <Column field="product_name" header="Ürün İsmi" sortable style={{ width: '22%' }}></Column>
                    {/* <Column field="stock_price" header="Satış Fiyatı" body={tlSimgesiEkle} sortable style={{ width: '10%' }}></Column> */}
                    <Column field="stock_quantity" bodyClassName={getBrandClassName} body={stockQuantityBodyTemplate} header="Toplam Stok" sortable style={{ width: '8%', fontWeight: 'bold', textAlign: 'center' }} ></Column>
                    <Column field="product_date" header="Ürün Giriş Tarihi" sortable style={{ width: '10%' }}></Column>
                    <Column header="Yeni Stok" style={{ width: '5%', textAlign: 'left' }} body={(rowData) => <Button icon="pi pi-caret-up" raised style={{ marginLeft: "10px" }} onClick={() => onEditClick(rowData)} />} />
                    <Column header="Düzenle" style={{ width: '4%', textAlign: 'left'}} body={(rowData) => <Button icon="pi pi-pencil" raised onClick={() => tableColumnEdit(rowData)} />} />
                    <Column header="Ürün Sil" style={{ width: '5%', textAlign: 'left' }} body={(rowData) => <Button icon="pi pi-trash" raised onClick={() => onDeleteClick(rowData)} />} />
                </DataTable>
                    {dialog}
                {/* Stok giriş dialog kısmı */}
                
                <Dialog header={selectedProduct?.product_name+' ürününe ait tüm stok bilgileri'} modal={false} visible={dialogVisible} onHide={hideDialog1}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                {loading && <ProgressSpinner />}</div>
                    <DataTable value={stockData} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="quantity" header="Stok Adeti"></Column>
                    <Column field="stock_price" body={tlSimgesiEkle} header="Stok Satış Fiyatı"></Column>
                    <Column field="invoice_date" header="Fatura Tarihi"></Column>
                    </DataTable>
                </Dialog>
                <Dialog header="Yeni Stok Ekle" visible={visible1} onHide={onHide1} modal className="p-fluid">
                  <form onSubmit={onStockEdit}>
                      <div className="field">
                          <label htmlFor="quantity" className="font-bold">Yeni Eklenecek Stok Adeti</label>
                          <InputText placeholder="Stok Adeti" keyfilter="num" id="quantity" autoFocus  onChange={(e) => setEditedData({ ...editedData, quantity: e.target.value })} required/>
                      </div>
                        <div className="field">
                          <label htmlFor="stock_price" className="font-bold">Yeni Eklenen Stoğun Satış Fiyatı</label>
                          {/* <InputText placeholder="Satış Fiyatı" id="stock_price" value={editedData.stock_price} onChange={(e) => setEditedData({ ...editedData, stock_price: e.target.value })} /> */}
                          <InputNumber placeholder="Satış Fiyatı" id="stock_price" inputId="horizontal-buttons" 
                            onValueChange={(e) => setEditedData({ ...editedData, stock_price: e.target.value })} 
                            showButtons buttonLayout="horizontal" step={0.25}
                            decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                            mode="currency" currency="TRY" required/>
                        </div>
                        <Message text="Stoğu eklediğiniz günün tarihi sisteme fatura tarihi olarak otomatik olarak eklenecektir." className="p-5 mt-5 mb-3"/>
                        <Button className="mt-3" disabled={isButtonDisabled} type="submit" label="Stoğu Kaydet" />
                  </form>
                </Dialog>

                {/* Stok giriş dialog kısmı-------BİTİŞ */}

            {/* Ürün Ekleme Dialog'u ------------------------ */}

            <Dialog header="Ürün Ekle" visible={urunEkle} onHide={onHide} style={{ width: '50rem' }} modal className="p-fluid">
            <form onSubmit={handleSubmit} className="p-4">
            <div className="field">
                    <label htmlFor="barcode_no" className="font-bold block mb-2">Barkod Numarası</label>
                    <InputText type="text" placeholder="Barkod Numarası" id="barcode_no" autoFocus onChange={e => setbarcodeNo(e.target.value)} rules={{ required: 'Barkod numarasını giriniz.' }} required />
                </div>
                <div className="field">
                    <label htmlFor="product_name" className="font-bold block mb-2">Ürün Adı</label>
                    <InputText type="text" placeholder="Ürün Adı" id="product_name" onChange={e => setproductName(e.target.value)} rules={{ required: 'Ürün adını giriniz.' }} required />
                </div>
                    <Button label="Ürünü Oluştur" icon="pi pi-check" severity="primary" raised style={{ width: '25%', padding: '15px'}} />
            </form></Dialog>

            {/* Ürün Ekleme Dialog'u BİTİŞ ------------------------ */}

            {/* Ürün Düzenleme Dialog'u ------------------------- */}

            <Dialog visible={visible} onHide={() => setVisible(false)} style={{ width: '50rem' }} modal header="Ürün Düzenle" className="p-fluid">
                <div className="field">
                    <label htmlFor="barcode_no" className="font-bold">Barkod Numarası</label>
                    <InputText id="barcode_no" value={selectedItem?.barcode_no} disabled onChange={(e) => setSelectedItem({...selectedItem, barcode_no: e.target.value})} />
                </div>
                <div className="field">
                    <label htmlFor="name" className="font-bold">Ürün Adı</label>
                    <InputText id="name" value={selectedItem?.product_name} onChange={(e) => setSelectedItem({...selectedItem, product_name: e.target.value})}  />
                </div>
                <Button label="Güncelle" icon="pi pi-sync" raised style={{ width: '26%', padding: '15px', marginTop: '10px'}} onClick={() => selectedItemUpdated()} />
            </Dialog>
            <ConfirmDialog header={selectedItem?.product_name+ ' ürünü siliniyor...'} 
            visible={confirmDialogVisible} 
            icon="pi pi-exclamation-triangle" 
            message="Silmek istediğinize emin misiniz ?"  
            footer={confirmDialogFooter} > 
            </ConfirmDialog>

            {/* Ürün Düzenleme Dialog BİTİŞ ------------------------ */}

            </Card></div>
    );
}