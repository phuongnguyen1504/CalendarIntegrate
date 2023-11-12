import Button from './Button';
import Icon from './Icon/Icon';

const Heading = ({title,onOpen,nameButton,padding, isDisplayBtn }) => {
    return (
       <section className="heading" style={{padding: padding && 0 }}>
           <h2  className="heading-title">{title}</h2>
           <Button disabled={!isDisplayBtn} style={{visibility: nameButton ? 'visible' : 'hidden'}} onClick={onOpen} className={'heading-button'} variant={'primary'}><Icon icon={'add'}/>  {nameButton}</Button>
       </section>
    );
}

export default Heading;