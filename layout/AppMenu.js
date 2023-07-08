import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model = [
        {
            label: 'Yönetici Anasayfa',
            items: [{ label: 'Anasayfa', icon: 'pi pi-fw pi-home', to: '/' },
                    { label: 'Kasiyer Anasayfası', icon: 'pi pi-fw pi-home', to: '/pages/kasiyerAnasayfa' }],
        },
        {
            label: 'Tanımlama ve Güncelleme',
            items: [
                { label: 'Malzeme Bilgileri', icon: 'pi pi-fw pi-box', to: '/pages/malzemeGiris' },
                { label: 'Kantin Heyeti Bilgileri', icon: 'pi pi-fw pi-bookmark', to: '/pages/kantinHeyeti' },
                { label: 'Firma Bilgileri', icon: 'pi pi-fw pi-briefcase', to: '/pages/firmaBilgileri' },
            ]
        },
        // {
        //     label: 'İŞLETME',
        //     items: [
        //         { label: 'Malzeme Alımı', icon: 'pi pi-fw pi-eye', to: '/blocks', badge: 'NEW' },
        //         { label: 'Kredili Alım', icon: 'pi pi-fw pi-bitcoin', url: 'https://www.primefaces.org/primeblocks-react', target: '_blank' },
        //         { label: 'Dağıtım', icon: 'pi pi-fw pi-clone', url: 'https://www.primefaces.org/primeblocks-react', target: '_blank' },
        //         { label: 'Kasa İşlemleri', icon: 'pi pi-fw pi-wallet', url: 'https://www.primefaces.org/primeblocks-react', target: '_blank' },
        //         { label: 'Bilanço İşlemleri', icon: 'pi pi-fw pi-tablet', url: 'https://www.primefaces.org/primeblocks-react', target: '_blank' }
        //     ]
        // },
        {
            label: 'RAPOR',
            items: [
                { label: 'Rapor', icon: 'pi pi-fw pi-calculator', to: '/pages/rapor' }
            ]
        },
        {
            label: 'YÖNETİCİ',
            items: [
                {
                    label: 'Şifre Değiştir',
                    icon: 'pi pi-fw pi-lock',
                    to: ''
                },
                {
                    label: 'Kasiyer İşlemleri',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Kasiyer Şifresini Değiştir',
                            icon: 'pi pi-fw pi-lock-open',
                            to: ''
                        }
                    ]
                },
                {
                    label: 'Çıkış Yap',
                    icon: 'pi pi-fw pi-sign-out',
                    to: ''
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
