'use client';
// Palette cards (the full theme editor): a card per saved palette to use or delete it, and an Add card that opens a form
// for a new one. In a Carousel, like the design-style cards beside them.
import { useState } from "react";
import { Form } from '../ui/form';
import { Modal } from '../ui/modal';
import { Field } from '../ui/field';
import { Button } from '../ui/button';
import { ToggleButton } from '../ui/toggle-button';
import { Icon } from '../ui/icon';
import { Carousel } from '../widgets/carousel';
import { withTheme } from "./hoc";

const Palettes = (props) => {
  const [ modal, setModal ] = useState(false);
  const current = props.theme.getPalette(props.theme.value('palette'));

  const add = (data) => {
    setModal(false);
    props.theme.add(data); // data: { primary, secondary } from the form
    props.notify('Palette created', 'success');
  }

  const remove = (id, event) => {
    event.stopPropagation();
    if (id === props.theme.palette) {
      props.notify('The palette in use can\'t be deleted', 'danger');
      return;
    }

    props.theme.remove(id);
    props.notify('Palette deleted', 'success');
  }

  return (
    <>
      <div data-component="palette-cards" className="bg border round shadow pad grid cols-1 gap-sm content-start h-100">
        <h3 className="h6 text-uppercase opacity-75">Palette: {current?.id}</h3>
        <Carousel slideWidth="11rem" label="Palettes">
          <button data-component="button" data-name="add" key="add" type="button" className="bg border round shadow col-center gap-sm h-100 w-100 hover-holographic" onClick={() => setModal(true)}>
            <Icon name="circle-plus" />
            <span className="fs-sm">Add palette</span>
          </button>
          {props.theme.palettes.map((single) => (
            <ThemeCard key={single.id} data={single} id={single.id} active={single.id === current?.id}
              update={() => props.update({ palette: single.id })} remove={remove} />
          ))}
        </Carousel>
      </div>
      {/* New theme: two color pickers, opened by the + button above. They start at the active theme's colors;
          keyed by the active theme so they reset to it after a theme is added or picked. */}
      <Modal title="Add New Theme" show={modal} setShow={setModal}>
        <Form key={props.theme.value('palette')} onSubmit={add} submitLabel="Create Theme" submitIcon="circle-plus">
          <Field type="color" name="primary" label="Primary color" defaultValue={current?.primary.hex} required />
          <Field type="color" name="secondary" label="Secondary color" defaultValue={current?.secondary.hex} required />
          <p className="fs-sm opacity-75">Pick the same color twice for a single-color theme.</p>
        </Form>
      </Modal>
      {/* <Status status={status} setStatus={setStatus} /> */}
    </>
  )  
}

// A palette as a card (the app card's classes): a band of its gradient (primary at the top, secondary at the bottom),
// under it its two colors (a dot, then the hex) beside the buttons: use it (a paint bucket; pressed while it is the
// active one), then delete it. The status colors are the same for every palette, so they aren't listed. Layout and
// look come from layout.css / utils / theme classes; only the colors are inline.
const ThemeCard = (props) => {
  const { data, id, active, update, remove } = props;
  const bg = `linear-gradient(to bottom, ${data.primary.hex}, ${data.secondary.hex})`;
  const colors = [ { name: 'primary', hex: data.primary.hex }, { name: 'secondary', hex: data.secondary.hex } ];
  return (
    <div data-component="palette-card" className="bg border round shadow grid cols-1 gap-0 h-100 overflow-hidden hover-holographic" style={{ gridTemplateRows: '1fr auto' }}>
      <div className="w-100" style={{ aspectRatio: '2 / 1', backgroundImage: bg }} role="img" aria-label={`palette ${id} colors`} />
      {/* The colors, then the buttons under them: side by side they're wider than an 11rem slide. */}
      <div className="pad-sm grid cols-1 gap-sm">
        <ul className="grid cols-1 text-uppercase" style={{ '--gap': 'var(--space-xs)', fontSize: 'var(--text-xs)' }}>
          {colors.map(c => (
            <li key={c.name} className="grid auto-cols items-center gap-sm" title={c.name}>
              <span className="circle" style={{ width: '1em', aspectRatio: 1, backgroundColor: c.hex }} />
              {c.hex}
            </li>
          ))}
        </ul>
        <div className="grid auto-cols" style={{ '--gap': 'var(--space-xs)' }}>
          <ToggleButton icon="fill-drip" className="success" aria-label={`Use palette ${id}`}
            title={active ? 'Current palette' : 'Use this palette'} open={active} onToggle={(on) => on && update()} />
          <Button icon="trash-can" className="outline-danger" aria-label={`Delete palette #${id}`} title="Delete this palette"
            onClick={(event) => remove(id, event)} />
        </div>
      </div>
    </div>
  )
}

const PaletteCards = withTheme(Palettes);

export { PaletteCards }
