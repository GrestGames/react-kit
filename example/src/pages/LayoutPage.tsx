import ShowCase from '../showcase/ShowCase';

import TopMenuBasic from '../examples/layout/TopMenuBasic';
import topMenuBasicSource from '../examples/layout/TopMenuBasic.tsx?raw';

import TabsBasic from '../examples/layout/TabsBasic';
import tabsBasicSource from '../examples/layout/TabsBasic.tsx?raw';

import PanelBasic from '../examples/layout/PanelBasic';
import panelBasicSource from '../examples/layout/PanelBasic.tsx?raw';

import CardsBasic from '../examples/layout/CardsBasic';
import cardsBasicSource from '../examples/layout/CardsBasic.tsx?raw';

export default function LayoutPage() {
  return (
    <>
      <h1 className="pageTitle">Layout & Navigation</h1>

      <ShowCase title="TopMenu (logo, dropdowns, right items)" source={topMenuBasicSource}>
        <TopMenuBasic />
      </ShowCase>

      <ShowCase title="Tabs" source={tabsBasicSource}>
        <TabsBasic />
      </ShowCase>

      <ShowCase title="PopupPanel" source={panelBasicSource}>
        <PanelBasic />
      </ShowCase>

      <ShowCase title="Cards, Card" source={cardsBasicSource}>
        <CardsBasic />
      </ShowCase>
    </>
  );
}
