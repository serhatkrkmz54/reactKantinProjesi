import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <img src={`/layout/images/logo.png`} alt="Logo" height="20" className="mr-2" />
            <span className="font-medium ml-2">J.Mu.Asb.Çvş. Serhat KORKMAZ - J.Uzm.Çvş.Mu. Ersan CENGİZ ®</span>
        </div>
    );
};

export default AppFooter;
