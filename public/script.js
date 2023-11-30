const getThings = async() => {
  try {
      return (await fetch("api/things/")).json();
  } catch (error) {
      console.log(error);
  }
};

const showThings = async() => {
  let things = await getThings();
  let thingsDiv = document.getElementById("thing-list");
  thingsDiv.innerHTML = "";
  things.forEach((thing) => {
      const section = document.createElement("section");
      section.classList.add("thing");
      thingsDiv.append(section);

      const a = document.createElement("a");
      a.href = "#";
      section.append(a);

      const h3 = document.createElement("h3");
      h3.innerHTML = thing.name;
      a.append(h3);

      const img = document.createElement("img");
      img.src = thing.img;
      section.append(img);

      a.onclick = (e) => {
          e.preventDefault();
          displayDetails(thing);
      };
  });
};

const displayDetails = (thing) => {
  const thingDetails = document.getElementById("thing-details");
  thingDetails.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.innerHTML = thing.name;
  thingDetails.append(h3);

  const dLink = document.createElement("a");
  dLink.innerHTML = "Delete";
  thingDetails.append(dLink);
  dLink.id = "delete-link";

  const eLink = document.createElement("a");
  eLink.innerHTML = "Edit";
  thingDetails.append(eLink);
  eLink.id = "edit-link";

  const inventor = document.createElement("p");
  thingDetails.append(inventor);
  inventor.innerHTML = thing.inventor;

  const date = document.createElement("p");
  thingDetails.append(date);
  date.innerHTML = thing.inventionDate;

  const desc = document.createElement("p");
  thingDetails.append(desc);
  desc.innerHTML = thing.description;

  const ul = document.createElement("ul");
  thingDetails.append(ul);
  console.log(thing.funFacts);
  thing.funFacts.forEach((fact) => {
      const li = document.createElement("li");
      ul.append(li);
      li.innerHTML = fact;
  });

  eLink.onclick = (e) => {
      e.preventDefault();
      document.querySelector(".dialog").classList.remove("transparent");
      document.getElementById("add-edit-title").innerHTML = "Edit Thing";
  };

  dLink.onclick = (e) => {
      e.preventDefault();
      deleteThing(thing);
  };

  populateEditForm(thing);
};

const deleteThing = async(thing) => {
  let response = await fetch(`/api/things/${thing._id}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json"
      }
  });

  if (response.status != 200) {
      console.log("error deleting");
      return;
  }

  let result = await response.json();
  showThings();
  document.getElementById("thing-details").innerHTML = "";
  resetForm();
}

const populateEditForm = (thing) => {
  const form = document.getElementById("add-edit-thing-form");
  form._id.value = thing._id;
  form.name.value = thing.name;
  form.inventor.value = thing.inventor;
  form.inventionDate.value = thing.inventionDate;
  form.description.value = thing.description;
  populateFact(thing)
};

const populateFact = (thing) => {
  const section = document.getElementById("facts-boxes");

  thing.funFacts.forEach((fact) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = fact;
      section.append(input);
  });
}

const addEditThing = async(e) => {
  e.preventDefault();
  const form = document.getElementById("add-edit-thing-form");
  const formData = new FormData(form);
  let response;
  formData.append("funFacts", getFacts());

  if (form._id.value == -1) {
      formData.delete("_id");

      response = await fetch("/api/things", {
          method: "POST",
          body: formData
      });
  } else {
      console.log(...formData);

      response = await fetch(`/api/things/${form._id.value}`, {
          method: "PUT",
          body: formData
      });
  }

  //successfully got data from server
  if (response.status != 200) {
      console.log("Error posting data");
  }

  thing = await response.json();

  if (form._id.value != -1) {
      displayDetails(thing);
  }

  resetForm();
  document.querySelector(".dialog").classList.add("transparent");
  showThings();
};

const getFacts = () => {
  const inputs = document.querySelectorAll("#facts-boxes input");
  let funFacts = [];

  inputs.forEach((input) => {
    funFacts.push(input.value);
  });

  return funFacts;
}

const resetForm = () => {
  const form = document.getElementById("add-edit-thing-form");
  form.reset();
  form._id = "-1";
  document.getElementById("facts-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
  e.preventDefault();
  document.querySelector(".dialog").classList.remove("transparent");
  document.getElementById("add-edit-title").innerHTML = "Add Thing";
  resetForm();
};

const addFact = (e) => {
  e.preventDefault();
  const section = document.getElementById("facts-boxes");
  const input = document.createElement("input");
  input.type = "text";
  section.append(input);
}

window.onload = () => {
  showThings();
  document.getElementById("add-edit-thing-form").onsubmit = addEditThing;
  document.getElementById("add-link").onclick = showHideAdd;

  document.querySelector(".close").onclick = () => {
      document.querySelector(".dialog").classList.add("transparent");
  };

  document.getElementById("add-facts").onclick = addFact;
};