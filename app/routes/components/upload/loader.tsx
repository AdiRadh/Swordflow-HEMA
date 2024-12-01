import style from './loader.module.css';

export function Loader({ show }: { show: boolean }) {
  return (
    <div className={`${style.loader} ${show ? style.show : style.hide}`}></div>
  );
}
