var b1 = document.getElementById("b"),
    installments = document.getElementById("inst");
    
if(parseInt(installments.getinnerHTML())>0){
    b1.setText("PAY NEXT PREMIUM");
    installments.setText(parseInt(installments.getText())-1);
}
else{
    b1.setText("CLAIM NOW!");
}