import ShowCase from '../showcase/ShowCase';

import TopMenuBasic from '../examples/layout/TopMenuBasic';
import topMenuBasicSource from '../examples/layout/TopMenuBasic.tsx?raw';

import PanelBasic from '../examples/layout/PanelBasic';
import panelBasicSource from '../examples/layout/PanelBasic.tsx?raw';

import AlertBasic from '../examples/layout/AlertBasic';
import alertBasicSource from '../examples/layout/AlertBasic.tsx?raw';

import TabsBasic from '../examples/layout/TabsBasic';
import tabsBasicSource from '../examples/layout/TabsBasic.tsx?raw';

import LoadingPopupBasic from '../examples/layout/LoadingPopupBasic';
import loadingPopupBasicSource from '../examples/layout/LoadingPopupBasic.tsx?raw';

export default function LayoutPage() {
  return (
    <>
      <h1 className="pageTitle">Layout</h1>

      <ShowCase title="TopMenu (logo, dropdowns, right items)" source={topMenuBasicSource}>
        <TopMenuBasic />
      </ShowCase>

      <ShowCase title="PopupPanel" source={panelBasicSource}>
        <PanelBasic />
      </ShowCase>

      <ShowCase title="Alert, ErrorAlert" source={alertBasicSource}>
        <AlertBasic />
      </ShowCase>

      <ShowCase title="Tabs" source={tabsBasicSource}>
        <TabsBasic />
      </ShowCase>

      <ShowCase title="LoadingPopup, BatchProgressPopup" source={loadingPopupBasicSource}>
        <LoadingPopupBasic />
      </ShowCase>
    </>
  );
}
