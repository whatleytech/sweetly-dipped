import styles from "./TreatsGrid.module.css";
import pretzel from "@/assets/images/pretzels.png";
import oreo from "@/assets/images/oreos.png";
import marshmallow from "@/assets/images/marshmallows.png";
import riceKrispies from "@/assets/images/rice-krispies.png";

const treats = [
  {
    id: "oreos",
    name: "Oreos",
    description:
      "Classic Oreo cookies enrobed in smooth chocolate for an irresistible treat.",
    image: oreo,
  },
  {
    id: "pretzels",
    name: "Pretzels",
    description:
      "Crunchy pretzels dipped in rich chocolate for the perfect sweet and salty combination.",
    image: pretzel,
  },
  {
    id: "marshmallows",
    name: "Marshmallows",
    description:
      "Fluffy marshmallows dipped in premium chocolate for a melt-in-your-mouth experience.",
    image: marshmallow,
  },
  {
    id: "rice-krispies",
    name: "Rice Krispies",
    description:
      "Crispy rice cereal treats covered in chocolate for a delightful crunch.",
    image: riceKrispies,
  },
];

export const TreatsGrid = () => {
  return (
    <section className={styles.treatsSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Our Treats</h2>
        <div className={styles.grid}>
          {treats.map((treat) => (
            <div key={treat.id} className={styles.card}>
              <img
                src={treat.image}
                alt={`Chocolate covered ${treat.name}`}
                className={styles.image}
              />
              <h3 className={styles.treatName}>{treat.name}</h3>
              <p className={styles.description}>{treat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
