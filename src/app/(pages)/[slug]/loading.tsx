import styles from './index.module.scss' // Import your CSS module

const Loader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>{message}</div>
    </div>
  )
}

export default Loader
